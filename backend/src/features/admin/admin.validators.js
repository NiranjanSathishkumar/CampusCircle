const Joi = require("joi");
const { objectId, email, newPassword, displayName, year } = require("../../validators/common");
const { BRANCHES } = require("../../models/User");
const { COMMUNITY_CATEGORIES } = require("../../models/Community");

// createOrganizer spreads the leftover body keys straight into a new Community
// document, so every optional field an admin may set is listed explicitly here.
// Anything absent (isVerified, isActive, followerCount, coreTeam, createdBy, …)
// is stripped before it reaches the model.
const createOrganizer = Joi.object({
    name: displayName.required(),
    email: email.required(),
    password: newPassword.required(),
    category: Joi.string().trim().valid(...COMMUNITY_CATEGORIES).required(),

    description: Joi.string().trim().max(1000).allow(""),
    location: Joi.string().trim().max(200).allow(""),
    establishedYear: year,
    leadOrganizer: Joi.string().trim().max(128).allow(""),
    isRecruiting: Joi.boolean(),
    tags: Joi.array().items(Joi.string().trim().lowercase().min(1).max(30)).max(20).unique(),
})
    // Client payloads and integration tests commonly send "bio" instead of the
    // schema's "description" - without this, stripUnknown silently drops it
    // and the community is saved with an empty description.
    .rename("bio", "description", { ignoreUndefined: true, override: true });

const paginationQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

const organizerParams = Joi.object({ organizerId: objectId.required() });

const listOrganizersQuery = paginationQuery.keys({
    isActive: Joi.boolean(),
    category: Joi.string().trim().max(60),
    search: Joi.string().trim().max(200),
});

const updateOrganizerStatus = Joi.object({
    isActive: Joi.boolean().required(),
});

const auditLogsQuery = paginationQuery.keys({
    community: objectId,
});

// Higher limit ceiling than paginationQuery's default 100: a platform-wide
// student directory realistically outgrows that in a single page load far
// sooner than the organizer/audit-log lists this shares a filter shape with,
// and there's no pagination UI here (yet) to fall back on for the overflow.
const listStudentsQuery = paginationQuery.keys({
    search: Joi.string().trim().max(200),
    branch: Joi.string().valid(...BRANCHES),
    limit: Joi.number().integer().min(1).max(500).default(100),
});

module.exports = {
    createOrganizer,
    paginationQuery, organizerParams, listOrganizersQuery, updateOrganizerStatus,
    auditLogsQuery,
    listStudentsQuery,
};
