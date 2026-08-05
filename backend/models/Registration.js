const mongoose = require("mongoose");
const crypto = require("crypto");
const { Schema } = mongoose;
// Shared with CommunityApplication — see answer.schema.js for why.
const answerSchema = require("./answer.schema");

const registrationSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    // The registering student — the "leader" even for a solo registration.
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Optional team name for team registrations (validated conditionally in service layer)
    teamName: { type: String, trim: true },

    // No default on purpose — must be explicitly set to "confirmed" or
    // "waitlisted" based on the outcome of the atomic capacity check
    // against Event.confirmedRegistrationIds.
    status: {
      type: String,
      enum: ["confirmed", "waitlisted", "cancelled"],
      required: true,
    },

    answers: [answerSchema],

    // ── Payment (server-authoritative) ────────────────────────────
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "failed"],
      default: "not_required",
    },
    // Snapshot of what was actually charged, taken from Event.price at
    // order-creation time — an audit trail independent of Event.price,
    // which could in principle be edited later. Never sourced from client input.
    amountPaid: { type: Number, default: 0, min: 0 },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },

    cancelledAt: { type: Date },
    cancellationReason: { type: String, trim: true },

    // ── Attendance (covers the leader — always a participant) ───────
    // Auto-generated, unique, unguessable. Not hashed — it's looked up
    // directly at scan time and only grants a one-time attendance mark,
    // not account access, so the risk profile doesn't call for it.
    qrToken: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

// A student may hold at most one ACTIVE (non-cancelled) registration per
// event. Partial index so a cancelled registration doesn't permanently
// block re-registering for the same event.
registrationSchema.index(
  { event: 1, student: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } }
);
// Per-event registrant listing / branch-year breakdown / confirmed vs waitlisted split.
registrationSchema.index({ event: 1, status: 1 });
// Registration timeline analytics — date-bucketed aggregation over createdAt.
registrationSchema.index({ event: 1, createdAt: 1 });
// "My Events" page — a student's own registrations, across all events.
registrationSchema.index({ student: 1 });
// "My Events" page filter by status (confirmed / waitlisted / cancelled).
registrationSchema.index({ student: 1, status: 1 });

// Payment idempotency indexes — sparse unique indexes so multiple unpaid (null/undefined)
// registrations are allowed, but duplicate Razorpay IDs are strictly prevented.
registrationSchema.index(
  { razorpayOrderId: 1 },
  { unique: true, sparse: true }
);
registrationSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, sparse: true }
);

const Registration = mongoose.model("Registration", registrationSchema);
module.exports = Registration;
