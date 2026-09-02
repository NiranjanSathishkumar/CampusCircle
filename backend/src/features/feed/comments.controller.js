// Comments on a post (models/Comment.js). Flat by design - no reply threading.
// Student: add / delete own comment; organizer moderates on their own posts.
// Post.commentsCount is maintained by the model's save/delete hooks, so do not
// $inc it here or it will double-count.
const Comment = require("../../models/Comment");
const Post = require("../../models/Post");

module.exports.addComment = async (req, res) => {
    const student = req.user;
    const { postId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await (await Comment.create({ student: student._id, post: postId, content })).populate(
        "student",
        "name profilePicture",
    );

    return res.status(201).json({ message: "Comment added", comment });
};

module.exports.listComments = async (req, res) => {
    const { postId } = req.params;
    const { page, limit } = req.query;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const filter = { post: postId, isActive: true };
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
        Comment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).populate("student", "name profilePicture"),
        Comment.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, comments, page, limit, total, totalPages: Math.ceil(total / limit) });
};

module.exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findOne({ _id: commentId, isActive: true });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (req.role === "student") {
        if (!comment.student.equals(req.user._id)) {
            return res.status(403).json({ message: "You can only delete your own comment" });
        }
    } else if (req.role === "organizer") {
        // organizer: moderation is scoped to posts belonging to their own community
        const post = await Post.findById(comment.post);
        if (!post || !post.community.equals(req.user._id)) {
            return res.status(403).json({ message: "You can only moderate comments on your own posts" });
        }
    }
    // admin: platform-wide moderation, no ownership check

    comment.isActive = false;
    comment.deletedAt = new Date();
    await comment.save();

    return res.status(200).json({ message: "Comment deleted" });
};
