// Likes on a post (models/Like.js). Student: like / unlike.
// {student, post} is uniquely indexed - treat a duplicate-key error as
// "already liked" rather than letting it surface as a 500.
// Post.likesCount is maintained by the model's hooks.
const Like = require("../../models/Like");
const Post = require("../../models/Post");

module.exports.likePost = async (req, res) => {
    const student = req.user;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Re-liking reactivates the old (soft-deleted) doc instead of creating a
    // new one, so createdAt stays the original like date. This is one atomic
    // findOneAndUpdate guarded by isActive: false, so two concurrent re-likes
    // can't both read the inactive doc, both save(), and each fire the
    // post-save hook - which would double-increment likesCount.
    const reactivated = await Like.findOneAndUpdate(
        { student: student._id, target: postId, targetType: "Post", isActive: false },
        { $set: { isActive: true, unlikedAt: null } },
    );

    if (reactivated) {
        // Bypassing save() also bypasses its likesCount hook, so sync it here.
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
        return res.status(201).json({ message: "Post liked" });
    }

    try {
        await new Like({ student: student._id, target: postId, targetType: "Post" }).save();
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Already liked" });
        }
        throw err;
    }

    return res.status(201).json({ message: "Post liked" });
};

module.exports.unlikePost = async (req, res) => {
    const student = req.user;
    const { postId } = req.params;

    // Same atomic-guard fix as likePost: two concurrent unlikes must not both
    // flip isActive and both fire the post-save hook's likesCount decrement.
    const unliked = await Like.findOneAndUpdate(
        { student: student._id, target: postId, targetType: "Post", isActive: true },
        { $set: { isActive: false, unlikedAt: new Date() } },
    );

    if (!unliked) return res.status(404).json({ message: "You have not liked this post" });

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

    return res.status(200).json({ message: "Post unliked" });
};
