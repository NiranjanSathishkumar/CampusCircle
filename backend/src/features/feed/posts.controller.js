// Community-authored posts (models/Post.js).
// Organizer: create / update / delete own posts, optionally linked to an Event.
// Student: the Discover feed - every active community's posts by default,
// optionally narrowed to just followed communities, plus tag filter, text
// search, paginated newest-first.
// likesCount / commentsCount are display caches; Like and Comment are the truth.
const Post = require("../../models/Post");
const Event = require("../../models/Event");
const Community = require("../../models/Community");
const Comment = require("../../models/Comment");
const Like = require("../../models/Like");
const Follow = require("../../models/Follow");
const Notification = require("../../models/Notification");
const { deleteEverywhere } = require("../../utils/fileStorage");
const { notifyCommunityPost } = require("../../services/notification.service");


const MAX_ATTACHMENTS = 10;
module.exports.MAX_ATTACHMENTS = MAX_ATTACHMENTS;

// Attaches likedByMe to plain (lean) post objects for the requesting student -
// no feed/post-read endpoint otherwise exposes whether the current user has
// liked a post, since likesCount is just an aggregate. Only students can like
// posts, so any other role always sees likedByMe: false.
const attachLikedByMe = async (posts, req) => {
    if (req.role !== "student" || posts.length === 0) {
        return posts.map((p) => ({ ...p, likedByMe: false }));
    }

    const likedIds = await Like.find({
        student: req.user._id,
        target: { $in: posts.map((p) => p._id) },
        targetType: "Post",
        isActive: true,
    }).distinct("target");

    const likedSet = new Set(likedIds.map(String));
    return posts.map((p) => ({ ...p, likedByMe: likedSet.has(p._id.toString()) }));
};

const attachmentTypeOf = (mimetype) => {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("video/")) return "video";
    return "document";
};

module.exports.createPost = async (req, res) => {
    const community = req.user;
    const { title, content, type, isPublished, event, tags, autoDeleteAfterMonths } = req.body;

    if (event) {
        const eventDoc = await Event.findById(event);
        if (!eventDoc || !eventDoc.community.equals(community._id) || !eventDoc.isActive) {
            return res.status(404).json({ message: "Event not found" });
        }
    }

    const post = new Post({ community: community._id, title, content, type, isPublished, event, tags, autoDeleteAfterMonths });

    try {
        await post.save();
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        throw err;
    }

    // Drafts don't notify followers - only a post that's actually live does.
    if (post.isPublished) {
        await notifyCommunityPost({ community: community._id, post: post._id });
    }

    return res.status(201).json({ message: "Post created", post });
};

module.exports.updatePost = async (req, res) => {
    const community = req.user;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, community: community._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const wasPublished = post.isPublished;

    if (req.body.event !== undefined) {
        if (req.body.event === null) {
            post.event = undefined;
        } else {
            const eventDoc = await Event.findById(req.body.event);
            if (!eventDoc || !eventDoc.community.equals(community._id) || !eventDoc.isActive) {
                return res.status(404).json({ message: "Event not found" });
            }
            post.event = req.body.event;
        }
    }

    if (req.body.title !== undefined) post.title = req.body.title;
    if (req.body.content !== undefined) post.content = req.body.content;
    if (req.body.type !== undefined) post.type = req.body.type;
    if (req.body.isPublished !== undefined) post.isPublished = req.body.isPublished;
    if (req.body.tags !== undefined) post.tags = req.body.tags;
    // Recomputes expiresAt (relative to the post's original createdAt) via the pre-save hook.
    if (req.body.autoDeleteAfterMonths !== undefined) post.autoDeleteAfterMonths = req.body.autoDeleteAfterMonths;

    try {
        await post.save();
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        throw err;
    }

    // A draft going live for the first time notifies followers, same as a
    // freshly created published post - any other edit doesn't re-notify.
    if (!wasPublished && post.isPublished) {
        await notifyCommunityPost({ community: community._id, post: post._id });
    }

    return res.status(200).json({ message: "Post updated", post });
};

// Shared by the manual delete endpoint (community-triggered, any time) and the
// auto-delete job (jobs/autoDeleteContent.job.js, triggered by expiresAt).
const deletePostCascade = async (post) => {
    await Promise.all(post.attachments.map((a) => deleteEverywhere(a.filename, a.cloudinaryId)));

    // Cascade cleanup: comments/likes/notifications belong to a post and don't outlive it.
    // Plain deleteMany (no per-doc count-sync hooks fire) since the post
    // whose counts they'd adjust is being deleted in the same breath.
    await Promise.all([
        Comment.deleteMany({ post: post._id }),
        Like.deleteMany({ target: post._id, targetType: "Post" }),
        Notification.deleteMany({ target: post._id, targetType: "Post" }),
    ]);

    await post.deleteOne();
};
module.exports.deletePostCascade = deletePostCascade;

module.exports.deletePost = async (req, res) => {
    const community = req.user;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, community: community._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    await deletePostCascade(post);

    return res.status(200).json({ message: "Post deleted" });
};

module.exports.addAttachments = async (req, res) => {
    const community = req.user;
    const { postId } = req.params;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    // Files are already uploaded to Cloudinary by syncToCloudinary before this
    // controller runs, so every early return below must clean them up itself.
    const cleanupUploads = () =>
        Promise.all(req.files.map((file) => deleteEverywhere(file.filename, file.cloudinary.publicId, "auto")));

    const post = await Post.findOne({ _id: postId, community: community._id });
    if (!post) {
        await cleanupUploads();
        return res.status(404).json({ message: "Post not found" });
    }

    if (post.attachments.length + req.files.length > MAX_ATTACHMENTS) {
        await cleanupUploads();
        return res.status(400).json({ message: `A post cannot exceed ${MAX_ATTACHMENTS} attachments` });
    }

    post.attachments.push(
        ...req.files.map((file) => ({
            url: file.cloudinary.url,
            cloudinaryId: file.cloudinary.publicId,
            type: attachmentTypeOf(file.mimetype),
            filename: file.filename,
        })),
    );

    try {
        await post.save();
    } catch (err) {
        await cleanupUploads();
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        throw err;
    }

    return res.status(200).json({ message: "Attachments added", post });
};

module.exports.removeAttachment = async (req, res) => {
    const community = req.user;
    const { postId, attachmentId } = req.params;

    const post = await Post.findOne({ _id: postId, community: community._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const attachment = post.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ message: "Attachment not found" });

    await deleteEverywhere(attachment.filename, attachment.cloudinaryId);

    attachment.deleteOne();
    await post.save();

    return res.status(200).json({ message: "Attachment removed", post });
};

module.exports.getPost = async (req, res) => {
    const { postId } = req.params;

    // A draft is only visible to the organizer that owns it - everyone else
    // (student, admin, another organizer) gets the same 404 as a post that
    // doesn't exist. {community: null} never matches a real post, so this
    // $or collapses to "isPublished: true only" for any non-organizer caller.
    const ownerCommunityId = req.role === "organizer" ? req.user._id : null;

    // Analytics only, incremented directly on read — no View collection.
    // expiresAt filter is a safety net for the window between expiry and the next
    // auto-delete sweep. $not (rather than $gt) so a legacy post that predates this
    // field (expiresAt missing) fails open — stays visible — instead of vanishing.
    const post = await Post.findOneAndUpdate(
        {
            _id: postId,
            expiresAt: { $not: { $lte: new Date() } },
            $or: [{ isPublished: true }, { community: ownerCommunityId }],
        },
        { $inc: { viewsCount: 1 } },
        { returnDocument: "after" },
    )
        .populate("community", "name logo")
        .populate("event", "title eventDate")
        .lean();

    if (!post) return res.status(404).json({ message: "Post not found" });

    const [postWithLikedState] = await attachLikedByMe([post], req);

    return res.status(200).json({ success: true, post: postWithLikedState });
};

module.exports.getDiscoverFeed = async (req, res) => {
    const student = req.user;
    const { tag, search, page, limit, followedOnly } = req.query;

    // Discover shows every active community's posts by default - following
    // is a narrowing filter the student can opt into (followedOnly=true),
    // not a gate on the feed itself.
    let communityIds;
    if (followedOnly) {
        const followedCommunityIds = await Follow.find({
            follower: student._id,
            followingType: "Community",
            isActive: true,
        }).distinct("following");

        communityIds = await Community.find({
            _id: { $in: followedCommunityIds },
            isActive: true,
        }).distinct("_id");
    } else {
        communityIds = await Community.find({ isActive: true }).distinct("_id");
    }

    // $not (rather than $gt) so a legacy post missing expiresAt fails open — stays visible.
    // isPublished is unconditional here - this route is student-only, so a
    // draft never belongs in the response regardless of who posted it.
    const filter = { community: { $in: communityIds }, expiresAt: { $not: { $lte: new Date() } }, isPublished: true };
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
        Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("community", "name logo").lean(),
        Post.countDocuments(filter),
    ]);

    const postsWithLikedState = await attachLikedByMe(posts, req);

    return res.status(200).json({ success: true, posts: postsWithLikedState, page, limit, total, totalPages: Math.ceil(total / limit) });
};

module.exports.listCommunityPosts = async (req, res) => {
    const { communityId } = req.params;
    const { page, limit } = req.query;

    const communityExists = await Community.exists({ _id: communityId, isActive: true });
    if (!communityExists) return res.status(404).json({ message: "Community not found" });

    // The organizer viewing their own community's post history sees drafts
    // too - this doubles as the "my posts" list for the organizer portal.
    // Anyone else (student, admin, another organizer) only sees what's live.
    const isOwner = req.role === "organizer" && req.user._id.equals(communityId);

    // $not (rather than $gt) so a legacy post missing expiresAt fails open — stays visible.
    const filter = { community: communityId, expiresAt: { $not: { $lte: new Date() } } };
    if (!isOwner) filter.isPublished = true;
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
        Post.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("community", "name logo")
            .populate("event", "title eventDate")
            .lean(),
        Post.countDocuments(filter),
    ]);

    const postsWithLikedState = await attachLikedByMe(posts, req);

    return res.status(200).json({ success: true, posts: postsWithLikedState, page, limit, total, totalPages: Math.ceil(total / limit) });
};
