const Joi = require("joi");
const { objectId } = require("../../validators/common");

const followingType = Joi.string().valid("User", "Community");

// Body for POST / — who to follow.
const followTarget = Joi.object({
    followingType: followingType.required(),
    followingId: objectId.required(),
});

// Params for DELETE /:followingType/:followingId and GET /followers/:followingType/:followingId
const targetParams = Joi.object({
    followingType: followingType.required(),
    followingId: objectId.required(),
});

// Query for GET /following and GET /followers/... — shared pagination.
const listQuery = Joi.object({
    followingType,
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { followTarget, targetParams, listQuery };
