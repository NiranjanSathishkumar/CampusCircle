const mongoose = require("mongoose");
const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

// A student can't like the same post twice — also makes "is this liked by
// me" an O(1) indexed point lookup.
likeSchema.index({ student: 1, post: 1 }, { unique: true });

// Per-post lookup: reconciling/auditing Post.likesCount (the cached
// counter) against the real count, or a future "liked by" list. Like
// itself stays the source of truth — likesCount is display-only cache.
likeSchema.index({ post: 1 });

// ── Post.likesCount synchronization hooks ───────────────────
likeSchema.post("save", async function () {
  await mongoose.model("Post").findByIdAndUpdate(this.post, { $inc: { likesCount: 1 } });
});

likeSchema.post("deleteOne", { document: true, query: false }, async function () {
  await mongoose.model("Post").findByIdAndUpdate(this.post, { $inc: { likesCount: -1 } });
});

likeSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Post").findByIdAndUpdate(doc.post, { $inc: { likesCount: -1 } });
  }
});

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
