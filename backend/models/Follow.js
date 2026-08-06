const mongoose = require("mongoose");
const { Schema } = mongoose;

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
  },
  { timestamps: true },
);

// A student can't follow the same target twice.
// followingType is included so a User and a Community can never be
// treated as the same target purely because their ObjectId collided.
followSchema.index(
  { follower: 1, following: 1, followingType: 1 },
  { unique: true },
);

// "Who do I follow" — a student's own following list (filtered by followingType if needed).
followSchema.index({ follower: 1, followingType: 1, createdAt: -1 });

// "Who follows me" — a target's follower list, and the follower-growth-
// over-time analytics chart (date-bucketed aggregation over createdAt).
followSchema.index({ following: 1, followingType: 1, createdAt: -1 });

// Self-follow prevention
followSchema.pre("validate", function () {
  if (this.followingType === "User" && this.follower.equals(this.following)) {
    throw new Error("A student cannot follow themselves");
  }
});

// ── followerCount / followingCount synchronization ──────────────────
// Adjusts both sides of the relationship: the target's followerCount
// (User or Community) and the follower's own followingCount (always
// a User). change is +1 on create, -1 on removal.
async function applyCountChange(follow, change) {
  if (!follow) return;

  try {
    const TargetModel = mongoose.model(follow.followingType);
    await TargetModel.findByIdAndUpdate(follow.following, {
      $inc: { followerCount: change },
    });
  } catch (err) {
    // mongoose.model() throws if followingType isn't registered yet
    // (require-order issue), and findByIdAndUpdate can reject on its
    // own. Either way, don't let it become an unhandled rejection —
    // log it so drift is at least visible.
    console.error(
      `[Follow] failed to update followerCount for ${follow.followingType} ${follow.following}:`,
      err,
    );
  }

  try {
    const User = mongoose.model("User");
    await User.findByIdAndUpdate(follow.follower, {
      $inc: { followingCount: change },
    });
  } catch (err) {
    console.error(
      `[Follow] failed to update followingCount for User ${follow.follower}:`,
      err,
    );
  }
}

// ── Create ────────────────────────────────────────────────────────
// isNew is only true the first time a document is saved. Capture it
// pre-save (it flips to false partway through save()), so a later
// unrelated .save() on the same doc never double-increments.
followSchema.pre("save", function () {
  this.$locals.wasNew = this.isNew;
});

followSchema.post("save", async function (doc) {
  if (doc.$locals.wasNew) {
    await applyCountChange(doc, 1);
  }
});

// ── Delete: document-based (doc.deleteOne()) ─────────────────────
followSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc) {
    await applyCountChange(doc, -1);
  },
);

// ── Delete: single-document query-based (findOneAndDelete) ───────
followSchema.post("findOneAndDelete", async function (doc) {
  await applyCountChange(doc, -1);
});

// ── Delete: query-based Follow.deleteOne(filter) ──────────────────
// Query middleware doesn't get the matched document(s), so fetch them
// in "pre" (before they're gone) and decrement in "post".
followSchema.pre("deleteOne", { document: false, query: true }, async function () {
  this._matched = await this.model.find(this.getFilter());
});
followSchema.post("deleteOne", { document: false, query: true }, async function () {
  for (const doc of this._matched || []) {
    await applyCountChange(doc, -1);
  }
});

// ── Delete: bulk Follow.deleteMany(filter) ────────────────────────
// e.g. cleaning up all follow edges when a User or Community is deleted.
followSchema.pre("deleteMany", async function () {
  this._matched = await this.model.find(this.getFilter());
});
followSchema.post("deleteMany", async function () {
  for (const doc of this._matched || []) {
    await applyCountChange(doc, -1);
  }
});

const Follow = mongoose.model("Follow", followSchema);
module.exports = Follow;