const mongoose = require("mongoose");
const { Schema } = mongoose;

// A comment on a Post. Deleting is a soft delete (isActive: false) instead
// of a document delete, so createdAt + deletedAt give a full history for
// analytics.
const commentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },

    // No parentComment field — comments are flat by requirement, enforced
    // structurally rather than by an application-level rule.

    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────

// A post's comment thread, in order.
commentSchema.index({ post: 1, isActive: 1, createdAt: 1 });

// Deletion (churn) chart. Sparse since deletedAt is usually unset.
commentSchema.index({ post: 1, deletedAt: -1 }, { sparse: true });

// ── Post.commentsCount synchronization ──────────────────────────────
// Comment is the source of truth; commentsCount on Post is a display cache.

async function adjustCommentsCount(postId, change) {
  await mongoose.model("Post").findByIdAndUpdate(postId, { $inc: { commentsCount: change } });
}

// Create, and delete (isActive true -> false) via save().
commentSchema.pre("save", function () {
  this.$locals.wasNew = this.isNew;
  this.$locals.isActiveChanged = !this.isNew && this.isModified("isActive");
});

commentSchema.post("save", async function (doc) {
  if (doc.$locals.wasNew) {
    await adjustCommentsCount(doc.post, 1);
  } else if (doc.$locals.isActiveChanged) {
    await adjustCommentsCount(doc.post, doc.isActive ? 1 : -1);
  }
});

// Hard deletes are cascade cleanup only (e.g. a Post being deleted), never
// a normal comment deletion. Skip already-inactive docs — already adjusted.

commentSchema.post("deleteOne", { document: true, query: false }, async function (doc) {
  if (doc.isActive) await adjustCommentsCount(doc.post, -1);
});

commentSchema.post("findOneAndDelete", async function (doc) {
  if (doc?.isActive) await adjustCommentsCount(doc.post, -1);
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
