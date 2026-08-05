const mongoose = require("mongoose");
const { Schema } = mongoose;

const followSchema = new Schema(
  {
    // Always a Student — Organizers (shared Community login) and Admins
    // don't follow anything.
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Polymorphic target: another Student (Buddies) or a Community.
    // followingType tells Mongoose (and refPath) which collection to
    // resolve `following` against.
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
  { timestamps: true }
);

// A student can't follow the same target twice.
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// "Who do I follow" — a student's own following list (filtered by followingType if needed).
followSchema.index({ follower: 1, followingType: 1, createdAt: -1 });

// "Who follows me" — a target's follower list, and the follower-growth-
// over-time analytics chart (date-bucketed aggregation over createdAt).
followSchema.index({ following: 1, followingType: 1, createdAt: -1 });

// Self-follow prevention. A same-document comparison, not a
// cross-collection check, so it belongs here rather than the service layer.
followSchema.pre("validate", function (next) {
  if (this.followingType === "User" && this.follower.equals(this.following)) {
    return next(new Error("A student cannot follow themselves"));
  }
  next();
});

// ── followerCount synchronization hooks ─────────────────────
async function updateFollowerCount(doc, change) {
  if (!doc) return;
  const TargetModel = mongoose.model(doc.followingType);
  if (TargetModel) {
    await TargetModel.findByIdAndUpdate(doc.following, {
      $inc: { followerCount: change },
    });
  }
}

followSchema.post("save", async function () {
  await updateFollowerCount(this, 1);
});

followSchema.post("deleteOne", { document: true, query: false }, async function () {
  await updateFollowerCount(this, -1);
});

followSchema.post("findOneAndDelete", async function (doc) {
  await updateFollowerCount(doc, -1);
});

const Follow = mongoose.model("Follow", followSchema);
module.exports = Follow;
