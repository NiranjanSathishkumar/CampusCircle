// Creates Notification documents. Called by other features, never by a route:
//   community_post        -> fan out to a community's followers when it posts
//   community_event       -> fan out to a community's followers when it creates an event
//   community_recruitment -> fan out to a community's followers when it opens a drive
//   waitlist_promotion    -> notify a student promoted off an event waitlist
//   role_promotion        -> notify a student whose CommunityMembership.label changed
//   new_follower          -> notify a student when another student follows them
//   team_invite            -> notify a student a team leader invited them to an event roster
//   team_invite_accepted   -> notify a leader an invited student accepted
//   team_invite_declined   -> notify a leader an invited student declined
//   event_updated          -> notify everyone registered for an event when the organizer edits it
//   event_reminder         -> notify everyone registered for an event once it's coming up soon
//   event_registration     -> notify an organizer when a student registers for their event
//   recruitment_application -> notify an organizer when a student applies to their drive
//   organizer_activated/organizer_deactivated -> notify an organizer when an admin (de)activates their account
// Centralised here so no feature needs to know the notification schema.
//
// A failure here must be logged and swallowed - it should never block the
// action (a post, a follow, a selection) that triggered it.
const Notification = require("../models/Notification");
const Follow = require("../models/Follow");
const Registration = require("../models/Registration");
const TeamMember = require("../models/TeamMember");

async function safely(fn) {
    try {
        await fn();
    } catch (err) {
        console.error("[notification.service] failed to notify:", err);
    }
}

async function communityFollowerIds(communityId) {
    return Follow.find({ following: communityId, followingType: "Community", isActive: true }).distinct("follower");
}

// Everyone with a stake in an event: registration leaders (confirmed or
// waitlisted - both are still "in" the event) plus team members who have
// actually accepted their invite (a pending invitee isn't committed yet).
async function eventParticipantIds(eventId) {
    const registrations = await Registration.find(
        { event: eventId, status: { $in: ["confirmed", "waitlisted"] } },
        "_id student",
    );
    if (registrations.length === 0) return [];

    const teamMemberIds = await TeamMember.find({
        registration: { $in: registrations.map((r) => r._id) },
        status: "accepted",
    }).distinct("student");

    const seen = new Map();
    for (const id of [...registrations.map((r) => r.student), ...teamMemberIds]) seen.set(String(id), id);
    return [...seen.values()];
}

module.exports.notifyCommunityPost = ({ community, post }) => safely(async () => {
    const recipients = await communityFollowerIds(community);
    if (recipients.length === 0) return;
    await Notification.insertMany(
        recipients.map((recipient) => ({ recipient, type: "community_post", target: post, targetType: "Post" })),
        { ordered: false },
    );
});

module.exports.notifyCommunityEvent = ({ community, event }) => safely(async () => {
    const recipients = await communityFollowerIds(community);
    if (recipients.length === 0) return;
    await Notification.insertMany(
        recipients.map((recipient) => ({ recipient, type: "community_event", target: event, targetType: "Event" })),
        { ordered: false },
    );
});

module.exports.notifyCommunityRecruitment = ({ community, recruitment }) => safely(async () => {
    const recipients = await communityFollowerIds(community);
    if (recipients.length === 0) return;
    await Notification.insertMany(
        recipients.map((recipient) => ({
            recipient, type: "community_recruitment", target: recruitment, targetType: "CommunityRecruitment",
        })),
        { ordered: false },
    );
});

module.exports.notifyWaitlistPromotion = ({ student, registration }) => safely(async () => {
    await Notification.create({
        recipient: student, type: "waitlist_promotion", target: registration, targetType: "Registration",
    });
});

module.exports.notifyRolePromotion = ({ student, membership }) => safely(async () => {
    await Notification.create({
        recipient: student, type: "role_promotion", target: membership, targetType: "CommunityMembership",
    });
});

module.exports.notifyTeamInvite = ({ student, actor, teamMember }) => safely(async () => {
    await Notification.create({
        recipient: student, actor, type: "team_invite", target: teamMember, targetType: "TeamMember",
    });
});

module.exports.notifyTeamInviteResponse = ({ student, actor, registration, accepted }) => safely(async () => {
    await Notification.create({
        recipient: student,
        actor,
        type: accepted ? "team_invite_accepted" : "team_invite_declined",
        target: registration,
        targetType: "Registration",
    });
});

module.exports.notifyNewFollower = ({ follower, followedUser }) => safely(async () => {
    const existing = await Notification.findOne({
        recipient: followedUser,
        type: "new_follower",
        actor: follower,
    });

    if (existing) {
        await Notification.updateOne(
            { _id: existing._id },
            { $set: { isRead: false, readAt: null, createdAt: new Date() } }
        );
        return;
    }

    await Notification.create({
        recipient: followedUser, type: "new_follower", actor: follower, target: follower, targetType: "User",
    });
});

module.exports.notifyEventUpdated = ({ event }) => safely(async () => {
    const recipients = await eventParticipantIds(event);
    if (recipients.length === 0) return;
    await Notification.insertMany(
        recipients.map((recipient) => ({ recipient, type: "event_updated", target: event, targetType: "Event" })),
        { ordered: false },
    );
});

// Called by jobs/eventReminder.job.js once an event enters a reminder
// window (2 days out, 1 day out) - that job also owns the once-per-window
// guard (Event.remindersSent).
module.exports.notifyEventReminder = ({ event }) => safely(async () => {
    const recipients = await eventParticipantIds(event);
    if (recipients.length === 0) return;
    await Notification.insertMany(
        recipients.map((recipient) => ({ recipient, type: "event_reminder", target: event, targetType: "Event" })),
        { ordered: false },
    );
});

// ── Organizer-facing notifications (recipient is a Community) ──

module.exports.notifyEventRegistration = ({ community, actor, registration }) => safely(async () => {
    await Notification.create({
        recipient: community,
        recipientType: "Community",
        actor,
        type: "event_registration",
        target: registration,
        targetType: "Registration",
    });
});

module.exports.notifyRecruitmentApplication = ({ community, actor, application }) => safely(async () => {
    await Notification.create({
        recipient: community,
        recipientType: "Community",
        actor,
        type: "recruitment_application",
        target: application,
        targetType: "CommunityApplication",
    });
});

// System-triggered (an admin action) - no actor, same convention as the
// community-fanout notifications above. Two distinct types rather than one
// type plus an isActive flag, because the target (the Community itself) is
// mutable — a later re-toggle would silently rewrite what an older
// notification appears to say if the copy were derived from live state
// instead of from `type`.
module.exports.notifyOrganizerStatusChanged = ({ community, isActive }) => safely(async () => {
    await Notification.create({
        recipient: community,
        recipientType: "Community",
        type: isActive ? "organizer_activated" : "organizer_deactivated",
        target: community,
        targetType: "Community",
    });
});

// ── Manual Payment Flow Notifications ─────────────────────────────

module.exports.notifyPaymentRequired = ({ student, registration }) => safely(async () => {
    await Notification.create({
        recipient: student,
        recipientType: "User",
        type: "payment_required",
        target: registration,
        targetType: "Registration",
    });
});

module.exports.notifyPaymentProofSubmitted = ({ student, registration }) => safely(async () => {
    await Notification.create({
        recipient: student,
        recipientType: "User",
        type: "payment_proof_submitted",
        target: registration,
        targetType: "Registration",
    });
});

module.exports.notifyPaymentProofReceived = ({ community, actor, registration }) => safely(async () => {
    await Notification.create({
        recipient: community,
        recipientType: "Community",
        actor,
        type: "payment_proof_received",
        target: registration,
        targetType: "Registration",
    });
});

module.exports.notifyPaymentConfirmed = ({ student, registration }) => safely(async () => {
    await Notification.create({
        recipient: student,
        recipientType: "User",
        type: "payment_confirmed",
        target: registration,
        targetType: "Registration",
    });
});

module.exports.notifyPaymentRejected = ({ student, registration, reason }) => safely(async () => {
    await Notification.create({
        recipient: student,
        recipientType: "User",
        type: "payment_rejected",
        target: registration,
        targetType: "Registration",
        message: reason,
    });
});

