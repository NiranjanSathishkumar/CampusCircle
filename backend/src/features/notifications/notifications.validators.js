const Joi = require("joi");
const { objectId } = require("../../validators/common");

const NOTIFICATION_TYPES = [
    "community_post",
    "community_event",
    "community_recruitment",
    "waitlist_promotion",
    "role_promotion",
    "new_follower",
    "team_invite",
    "team_invite_accepted",
    "team_invite_declined",
    "event_updated",
    "event_reminder",
    "event_registration",
    "recruitment_application",
    "organizer_activated",
    "organizer_deactivated",
];

const listQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    unreadOnly: Joi.boolean().default(false),
    type: Joi.string().valid(...NOTIFICATION_TYPES),
});

const notificationParams = Joi.object({ notificationId: objectId.required() });

module.exports = { listQuery, notificationParams, NOTIFICATION_TYPES };

