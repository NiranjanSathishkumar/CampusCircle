const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    // Polymorphic: a student (User) for most types, or a community
    // (Community) for the organizer-facing types below.
    recipient: { type: Schema.Types.ObjectId, required: true, refPath: "recipientType" },
    recipientType: { type: String, enum: ["User", "Community"], default: "User", required: true },

    type: {
      type: String,
      enum: [
        "community_post", // a followed community posted something new
        "community_event", // a followed community created a new event
        "community_recruitment", // a followed community opened a new recruitment drive
        "waitlist_promotion", // your event registration moved from waitlisted to confirmed
        "role_promotion", // your label changed in a community you're a member of
        "new_follower", // someone followed you
        "team_invite", // a team leader invited you to join their event roster
        "team_invite_accepted", // an invited student accepted your team invite
        "team_invite_declined", // an invited student declined your team invite
        "event_updated", // an event you're registered for was edited by the organizer
        "event_reminder", // an event you're registered for is coming up soon
        "event_registration", // organizer: a student registered for one of your events
        "recruitment_application", // organizer: a student applied to one of your recruitment drives
        "organizer_activated", // organizer: an admin activated your account
        "organizer_deactivated", // organizer: an admin deactivated your account
        "payment_required", // student: slot reserved, payment required
        "payment_proof_submitted", // student: payment screenshot uploaded, awaiting verification
        "payment_proof_received", // organizer: student uploaded payment proof to verify
        "payment_confirmed", // student: payment verified, registration confirmed & ticket generated
        "payment_rejected", // student: payment proof rejected by organizer
      ],
      required: true,
    },

    // Optional message (e.g. rejection reason or custom notice)
    message: { type: String, trim: true },

    // Who triggered it. Set for new_follower (the follower), team_invite
    // (the inviting leader), and team_invite_accepted/declined (the
    // responding student). Unset for every other type — those are
    // community- or system-triggered, and the frontend derives the
    // community by populating target instead.
    actor: { type: Schema.Types.ObjectId, ref: "User" },

    // What this notification links to when clicked. Polymorphic because
    // the target type varies with `type` above.
    target: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    targetType: {
      type: String,
      required: true,
      enum: [
        "Post",
        "Event",
        "CommunityRecruitment",
        "Registration",
        "CommunityMembership",
        "User",
        "TeamMember",
        "CommunityApplication",
        "Community",
      ],
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Bell dropdown — a recipient's notifications, most recent first.
notificationSchema.index({ recipient: 1, recipientType: 1, createdAt: -1 });
// Unread badge count.
notificationSchema.index({ recipient: 1, recipientType: 1, isRead: 1 });

// TTL index: 30-day retention window (2,592,000 seconds) for automatic notification cleanup.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
