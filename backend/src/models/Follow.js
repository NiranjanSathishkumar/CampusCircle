const mongoose = require("mongoose");
const { Schema } = mongoose;

// A student following a User or a Community (polymorphic via followingType).
// Unfollowing is a soft delete (isActive: false) instead of a document
// delete, so createdAt + unfollowedAt give a full history for analytics.
const followSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },

    following: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "followingType",
    },
    followingType: {
      type: String,
      required: true,
      enum: ["User", "Community"],
    },

    isActive: { type: Boolean, default: true },
    unfollowedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────

// One active follow per (follower, target). Partial on isActive so a
// student can unfollow and re-follow later without hitting the old doc.
followSchema.index(
  { follower: 1, following: 1, followingType: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

// "Who do I follow" list. followingType is optional on this query (the
// default view omits it), so it's placed after createdAt: Mongo can only
// use an index to avoid an in-memory sort when every field ahead of the
// sort key has an equality condition, and an omitted followingType has
// none. Keeping it after createdAt still lets the type-filtered variant
// use it as an index-level filter, just not as a seek bound.
followSchema.index({ follower: 1, isActive: 1, createdAt: -1, followingType: 1 });

// "Who follows me" list + follower-growth-over-time chart
followSchema.index({ following: 1, isActive: 1, followingType: 1, createdAt: -1 });

// Unfollow (churn) chart. Sparse since unfollowedAt is usually unset.
followSchema.index(
  { following: 1, followingType: 1, unfollowedAt: -1 },
  { sparse: true },
);

// ── Validation ────────────────────────────────────────────────────

followSchema.pre("validate", function () {
  const followerId = this.follower?._id ? String(this.follower._id) : String(this.follower || "");
  const followingId = this.following?._id ? String(this.following._id) : String(this.following || "");
  if (followerId && followingId && this.followingType === "User" && followerId === followingId) {
    throw new Error("A student cannot follow themselves");
  }
});

// ── followerCount / followingCount sync ──────────────────────────
// Keeps both sides in sync: the target's followerCount (User or Community)
// and the follower's own followingCount. +1 on follow, -1 on unfollow.
// Guards against underflow below 0 when decrementing.
//
// Both updates are attempted even if one fails (so a single bad write
// doesn't leave the other side of the relationship un-synced), but any
// failure is rethrown so callers know the counts may now be out of sync
// with the Follow documents instead of silently reporting success.
//
// This is the single place responsible for count changes — every caller
// (follow, unfollow, reactivate, cascade delete) must call it explicitly;
// nothing here triggers it implicitly via hooks.
async function applyCountChange(follow, change) {
  if (!follow) return;

  const errors = [];

  try {
    const TargetModel = mongoose.model(follow.followingType);
    const targetFilter = { _id: follow.following };
    if (change < 0) {
      targetFilter.followerCount = { $gt: 0 };
    }
    await TargetModel.updateOne(targetFilter, {
      $inc: { followerCount: change },
    });
  } catch (err) {
    console.error(
      `[Follow] failed to update followerCount for ${follow.followingType} ${follow.following}:`,
      err,
    );
    errors.push(err);
  }

  try {
    const User = mongoose.model("User");
    const userFilter = { _id: follow.follower };
    if (change < 0) {
      userFilter.followingCount = { $gt: 0 };
    }
    await User.updateOne(userFilter, {
      $inc: { followingCount: change },
    });
  } catch (err) {
    console.error(
      `[Follow] failed to update followingCount for User ${follow.follower}:`,
      err,
    );
    errors.push(err);
  }

  if (errors.length) {
    throw new Error(
      `[Follow] applyCountChange failed for follow ${follow._id}: ${errors
        .map((e) => e.message)
        .join("; ")}`,
    );
  }
}

// Hard deletes are cascade cleanup only (e.g. a User/Community being
// deleted), never a normal unfollow. Skip already-inactive docs — their
// count was adjusted when they were unfollowed.

followSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc) {
    if (doc.isActive) await applyCountChange(doc, -1);
  },
);

followSchema.post("findOneAndDelete", async function (doc) {
  if (doc?.isActive) await applyCountChange(doc, -1);
});

followSchema.pre("deleteOne", { document: false, query: true }, async function () {
  this._matched = await this.model.find(this.getFilter()).select("follower following followingType isActive").lean();
});
followSchema.post("deleteOne", { document: false, query: true }, async function () {
  for (const doc of this._matched || []) {
    if (doc.isActive) await applyCountChange(doc, -1);
  }
});

// deleteMany can match a large number of documents (e.g. cascade cleanup,
// test teardown), so unlike the single-document hooks above this doesn't
// load matched documents into memory or update them one at a time. Instead
// it aggregates the decrement each target/follower needs server-side, then
// applies all of them via a handful of bulkWrite calls.
followSchema.pre("deleteMany", async function () {
  const matchActive = { ...this.getFilter(), isActive: true };
  const [targetDecrements, followerDecrements] = await Promise.all([
    this.model.aggregate([
      { $match: matchActive },
      { $group: { _id: { following: "$following", followingType: "$followingType" }, count: { $sum: 1 } } },
    ]),
    this.model.aggregate([
      { $match: matchActive },
      { $group: { _id: "$follower", count: { $sum: 1 } } },
    ]),
  ]);
  this._targetDecrements = targetDecrements;
  this._followerDecrements = followerDecrements;
});

followSchema.post("deleteMany", async function () {
  const targetDecrements = this._targetDecrements || [];
  const followerDecrements = this._followerDecrements || [];
  if (!targetDecrements.length && !followerDecrements.length) return;

  const decrementOp = (field, id, count) => ({
    updateOne: {
      filter: { _id: id, [field]: { $gte: count } },
      update: { $inc: { [field]: -count } },
    },
  });

  const byType = { User: [], Community: [] };
  for (const { _id, count } of targetDecrements) {
    byType[_id.followingType].push(decrementOp("followerCount", _id.following, count));
  }
  const followingCountOps = followerDecrements.map(({ _id, count }) =>
    decrementOp("followingCount", _id, count),
  );

  const errors = [];
  const runBulkWrite = async (Model, ops, label) => {
    if (!ops.length) return;
    try {
      await Model.bulkWrite(ops, { ordered: false });
    } catch (err) {
      console.error(`[Follow] deleteMany bulk ${label} update failed:`, err);
      errors.push(err);
    }
  };

  await Promise.all([
    runBulkWrite(mongoose.model("User"), byType.User, "followerCount(User)"),
    runBulkWrite(mongoose.model("Community"), byType.Community, "followerCount(Community)"),
    runBulkWrite(mongoose.model("User"), followingCountOps, "followingCount(User)"),
  ]);

  if (errors.length) {
    throw new Error(`[Follow] deleteMany count sync failed: ${errors.map((e) => e.message).join("; ")}`);
  }
});

const Follow = mongoose.model("Follow", followSchema);
module.exports = Follow;
module.exports.applyCountChange = applyCountChange;
