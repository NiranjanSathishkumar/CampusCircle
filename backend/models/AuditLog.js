const mongoose = require("mongoose");
const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    // Which shared Organizer login this was — NOT which of the 3-8 people
    // behind it. Per Data Requirements Brief §3.1, individual attribution
    // within a shared Organizer account doesn't exist by design; this is
    // deliberately login-level accountability only, not action-level.
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    // Raw values, not pre-parsed into browser/OS/device fields — this
    // collection isn't part of the analytics engine, so there's no
    // performance case for storing derived structure. Parse at display
    // time if the audit-log UI ever needs it more readable.
    userAgent: { type: String, trim: true, maxlength: 500 },
    ipAddress: { type: String, trim: true, maxlength: 45 },
  },
  { timestamps: true } // createdAt IS the login timestamp — no separate loginAt field needed
);

// Login history for one community, most recent first — the collection's
// one real query pattern.
auditLogSchema.index({ community: 1, createdAt: -1 });

// TTL index: 180-day retention window (15,552,000 seconds) for automatic document expiration.
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
module.exports = AuditLog;
