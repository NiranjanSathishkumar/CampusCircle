const Joi = require("joi");
const { email, year, objectId, url } = require("../../validators/common");
const { COMMUNITY_SOCIAL_PLATFORMS } = require("../../models/Community");

// Mirrors the old allowedUpdates whitelist, minus `logo` and `banner`: those are
// media objects owned by the upload/remove routes, which also sync Cloudinary and
// clean up the replaced file. Letting a plain PATCH set them would leave the
// stored filename/cloudinaryId pointing at an asset nothing manages.
const updateInfo = Joi.object({
    name: Joi.string().trim().min(2).max(128),
    description: Joi.string().trim().max(1000).allow(""),
    category: Joi.string().trim().max(60),
    location: Joi.string().trim().max(200).allow(""),
    establishedYear: year,
    isRecruiting: Joi.boolean(),
    // Mirrors the [{ maxlength: 60 }], max 10 entries constraint on
    // Community.js's openRoles path.
    openRoles: Joi.array().items(Joi.string().trim().max(60)).max(10),
    leadOrganizer: Joi.string().trim().max(128).allow(""),
    email,
}).min(1);

// Core team, tags, social links and FAQs — all array-of-subdocument fields on the
// Community doc, edited by the logged-in organizer via req.community.

// .min(1) rejects whitespace-only input (trimmed to "" by Joi) with a 400 here,
// instead of letting it through to fail Mongoose's `required: true` at save().
const memberRole = Joi.string().trim().min(1).max(128);
const tag = Joi.string().trim().lowercase().min(1).max(30);
const platform = Joi.string().valid(...COMMUNITY_SOCIAL_PLATFORMS);

// Core team
const addCoreTeamMember = Joi.object({
    studentId: objectId,
    email,
    role: memberRole.required(),
}).or("studentId", "email");
const updateCoreTeamMemberRole = Joi.object({ role: memberRole.required() });
const coreTeamParams = Joi.object({ studentId: objectId.required() });

// Tags
const addTag = Joi.object({ tag: tag.required() });
const tagParams = Joi.object({ tag: tag.required() });

// Social links
const setSocialLink = Joi.object({
    platform: platform.required(),
    url: url.required(),
});
const socialLinkParams = Joi.object({ platform: platform.required() });

// FAQs
// .min(1) rejects whitespace-only input (trimmed to "" by Joi) with a 400 here,
// instead of letting it through to fail Mongoose's `required: true` at save().
const addFaq = Joi.object({
    question: Joi.string().trim().min(1).max(200).required(),
    answer: Joi.string().trim().min(1).max(1000).required(),
});
// PATCH/PUT: either field alone is a valid edit, but an empty body is not
const updateFaq = Joi.object({
    question: Joi.string().trim().min(1).max(200),
    answer: Joi.string().trim().min(1).max(1000),
}).min(1);
const faqParams = Joi.object({ faqId: objectId.required() });

// Audit log
const auditLogsQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

// Dashboard overview — scopes follower/registration growth deltas to a window.
const dashboardQuery = Joi.object({
    timeframe: Joi.string().valid("week", "month", "all").default("week"),
});

module.exports = {
    updateInfo,
    addCoreTeamMember, updateCoreTeamMemberRole, coreTeamParams,
    addTag, tagParams,
    setSocialLink, socialLinkParams,
    addFaq, updateFaq, faqParams,
    auditLogsQuery,
    dashboardQuery,
};
