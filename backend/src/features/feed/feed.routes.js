// Routes for the Discover feed: posts, comments, likes. Mount at /api/feed.
// Reads are student-facing; creating/editing a post is organizer-only, since a
// Post belongs to a Community and never to a student.
const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth, requireRole } = require("../../middleware/auth");
const { uploadPostMedia } = require("../../middleware/upload");
const syncToCloudinary = require("../../middleware/syncToCloudinary");
const validate = require("../../middleware/validate");
const schema = require("./feed.validators");

const {
    createPost,
    updatePost,
    deletePost,
    addAttachments,
    removeAttachment,
    getPost,
    getDiscoverFeed,
    listCommunityPosts,
    MAX_ATTACHMENTS,
} = require("./posts.controller");

const { addComment, listComments, deleteComment } = require("./comments.controller");
const { likePost, unlikePost } = require("./likes.controller");

router.use(requireAuth);

// Posts
router.route("/posts")
    .get(requireRole("student"), validate(schema.discoverQuery, "query"), wrapAsync(getDiscoverFeed))
    .post(requireRole("organizer"), validate(schema.createPost), wrapAsync(createPost));

router.route("/posts/:postId")
    .get(validate(schema.postParams, "params"), wrapAsync(getPost))
    .patch(requireRole("organizer"), validate(schema.postParams, "params"), validate(schema.updatePost), wrapAsync(updatePost))
    .delete(requireRole("organizer"), validate(schema.postParams, "params"), wrapAsync(deletePost));

router.route("/posts/:postId/attachments")
    .put(
        requireRole("organizer"),
        validate(schema.postParams, "params"),
        uploadPostMedia.array("attachments", MAX_ATTACHMENTS),
        syncToCloudinary("posts", "auto"),
        wrapAsync(addAttachments),
    );

router.route("/posts/:postId/attachments/:attachmentId")
    .delete(requireRole("organizer"), validate(schema.attachmentParams, "params"), wrapAsync(removeAttachment));

// Community post history
router.route("/communities/:communityId/posts")
    .get(validate(schema.communityParams, "params"), validate(schema.paginationQuery, "query"), wrapAsync(listCommunityPosts));

// Comments
router.route("/posts/:postId/comments")
    .get(validate(schema.postParams, "params"), validate(schema.paginationQuery, "query"), wrapAsync(listComments))
    .post(requireRole("student"), validate(schema.postParams, "params"), validate(schema.addComment), wrapAsync(addComment));

router.route("/comments/:commentId")
    .delete(requireRole("student", "organizer", "admin"), validate(schema.commentParams, "params"), wrapAsync(deleteComment));

// Likes
router.route("/posts/:postId/like")
    .post(requireRole("student"), validate(schema.postParams, "params"), wrapAsync(likePost))
    .delete(requireRole("student"), validate(schema.postParams, "params"), wrapAsync(unlikePost));

module.exports = router;
