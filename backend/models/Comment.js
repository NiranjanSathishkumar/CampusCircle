const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },

    // No parentComment / self-reference field, deliberately. Comments are
    // flat by requirement — no reply-to-reply threading — and that's
    // enforced structurally by this field not existing at all, rather
    // than by an application-level rule a future change could bypass.
  },
  { timestamps: true }
);

// A post's comment thread, in order — the one real query this collection
// serves. Works for oldest-first or newest-first display either way.
commentSchema.index({ post: 1, createdAt: 1 });

// ── Post.commentsCount synchronization hooks ────────────────
commentSchema.post("save", async function () {
  await mongoose.model("Post").findByIdAndUpdate(this.post, { $inc: { commentsCount: 1 } });
});

commentSchema.post("deleteOne", { document: true, query: false }, async function () {
  await mongoose.model("Post").findByIdAndUpdate(this.post, { $inc: { commentsCount: -1 } });
});

commentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Post").findByIdAndUpdate(doc.post, { $inc: { commentsCount: -1 } });
  }
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
