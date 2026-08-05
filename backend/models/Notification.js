const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: [
        "community_post", // a followed community posted something new
        "post_like", // someone liked your post
        "post_comment", // someone commented on your post
        "waitlist_promotion", // your registration moved from waitlisted to confirmed
      ],
      required: true,
    },

    // Who triggered it — always a Student, never a Community (a
    // followed-community post's "actor" is unset; the frontend derives
    // the community by populating target.community instead).
    // Also unset for waitlist_promotion, which is system-triggered.
    actor: { type: Schema.Types.ObjectId, ref: "User" },

    // What this notification links to when clicked. Polymorphic because
    // the target type varies with `type` above — see mapping table in chat.
    target: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    targetType: { type: String, required: true, enum: ["Post", "Registration"] },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Bell dropdown — a recipient's notifications, most recent first.
notificationSchema.index({ recipient: 1, createdAt: -1 });
// Unread badge count.
notificationSchema.index({ recipient: 1, isRead: 1 });

// TTL index: 30-day retention window (2,592,000 seconds) for automatic notification cleanup.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
