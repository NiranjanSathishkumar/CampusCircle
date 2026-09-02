const mongoose = require("mongoose");
const { Schema } = mongoose;

// A student liking a Post or an Event (polymorphic via targetType).
// Unliking is a soft delete (isActive: false) instead of a document
// delete, so createdAt + unlikedAt give a full history for analytics.
const likeSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },
    targetType: { type: String, required: true, enum: ["Post", "Event"] },

    isActive: { type: Boolean, default: true },
    unlikedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────

// One active like per (student, target). Partial on isActive so a student
// can unlike and re-like later without hitting the old doc.
likeSchema.index(
  { student: 1, target: 1, targetType: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

// Per-target lookup: reconciling/auditing the cached likesCount against
// the real count, or a future "liked by" list.
likeSchema.index({ target: 1, targetType: 1, isActive: 1, createdAt: -1 });

// Unlike (churn) chart. Sparse since unlikedAt is usually unset.
likeSchema.index(
  { target: 1, targetType: 1, unlikedAt: -1 },
  { sparse: true },
);

// ── likesCount synchronization ──────────────────────────────────────
// Like is the source of truth; likesCount on Post/Event is a display cache.

async function adjustLikesCount(targetType, targetId, change) {
  await mongoose
    .model(targetType)
    .findByIdAndUpdate(targetId, { $inc: { likesCount: change } });
}

// Create, and unlike (isActive true -> false) via save().
likeSchema.pre("save", function () {
  this.$locals.wasNew = this.isNew;
  this.$locals.isActiveChanged = !this.isNew && this.isModified("isActive");
});

likeSchema.post("save", async function (doc) {
  if (doc.$locals.wasNew) {
    await adjustLikesCount(doc.targetType, doc.target, 1);
  } else if (doc.$locals.isActiveChanged) {
    await adjustLikesCount(doc.targetType, doc.target, doc.isActive ? 1 : -1);
  }
});

// Hard deletes are cascade cleanup only (e.g. a Post/Event being deleted),
// never a normal unlike. Skip already-inactive docs — their count was
// adjusted when they were unliked.

likeSchema.post("deleteOne", { document: true, query: false }, async function (doc) {
  if (doc.isActive) await adjustLikesCount(doc.targetType, doc.target, -1);
});

likeSchema.post("findOneAndDelete", async function (doc) {
  if (doc?.isActive) await adjustLikesCount(doc.targetType, doc.target, -1);
});

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
