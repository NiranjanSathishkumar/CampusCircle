// Joi schemas for the public (any authenticated role) community discovery
// endpoints - listing/searching active communities and reading one detail
// page. Distinct from communities.validators.js, which covers the
// organizer-only /api/community self-management routes.
const Joi = require("joi");
const { objectId } = require("../../validators/common");

const paginationQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
});

const listCommunities = paginationQuery.keys({
    category: Joi.string().trim().max(60),
    search: Joi.string().trim().max(200),
    recruiting: Joi.boolean(),
});

const communityIdParams = Joi.object({ communityId: objectId.required() });

module.exports = { listCommunities, communityIdParams };
