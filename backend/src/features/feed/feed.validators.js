// Joi schemas for the feed: post content / tags / images, comment body, and the
// Discover query params (tag, search, pagination).
const Joi = require("joi");
const { objectId } = require("../../validators/common");

const tags = Joi.array().items(Joi.string().trim().lowercase().max(30)).max(20).unique();

// ── Posts ─────────────────────────────────────────────────────────
// Auto-delete timeline: community-only, 1-12 months, defaults to 6.
const autoDeleteAfterMonths = Joi.number().integer().min(1).max(12);

const postType = Joi.string().valid("Announcement", "Event", "Achievement", "Workshop", "Update", "Notice");

const createPost = Joi.object({
    title: Joi.string().trim().max(200).required(),
    content: Joi.string().trim().max(3000).required(),
    type: postType.default("Announcement"),
    isPublished: Joi.boolean().default(true),
    event: objectId,
    tags,
    autoDeleteAfterMonths: autoDeleteAfterMonths.default(6),
});

// PATCH: any subset of fields, but not an empty body. event: null unlinks it.
const updatePost = Joi.object({
    title: Joi.string().trim().max(200),
    content: Joi.string().trim().max(3000),
    type: postType,
    isPublished: Joi.boolean(),
    event: objectId.allow(null),
    tags,
    autoDeleteAfterMonths,
}).min(1);

const postParams = Joi.object({ postId: objectId.required() });
const attachmentParams = Joi.object({
    postId: objectId.required(),
    attachmentId: objectId.required(),
});
const communityParams = Joi.object({ communityId: objectId.required() });

const paginationQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

// Discover feed: every active community's posts by default, optionally
// narrowed to just followed communities, plus a tag / text search.
const discoverQuery = paginationQuery.keys({
    tag: Joi.string().trim().lowercase().max(30).allow(""),
    search: Joi.string().trim().max(200).allow(""),
    followedOnly: Joi.boolean().default(false),
});

// ── Comments ──────────────────────────────────────────────────────
const addComment = Joi.object({
    content: Joi.string().trim().max(1000).required(),
});
const commentParams = Joi.object({ commentId: objectId.required() });

module.exports = {
    createPost, updatePost, postParams, attachmentParams, communityParams,
    paginationQuery, discoverQuery,
    addComment, commentParams,
};
