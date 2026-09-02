const mongoose = require("mongoose");
const crypto = require("crypto");
const { Schema } = mongoose;
const answerSchema = require("./Answer.schema"); // shared with CommunityApplication
const profileSnapshotSchema = require("./ProfileSnapshot.schema"); // shared with CommunityApplication

const registrationSchema = new Schema(
  {
    // ── Core ──────────────────────────────────────────────────────
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true }, // leader, even solo
    teamName: { type: String, trim: true }, // team registrations only

    // No default — must be set explicitly from the capacity-check result.
    status: {
      type: String,
      enum: ["confirmed", "waitlisted", "cancelled"],
      required: true,
    },

    answers: [answerSchema],

    profileSnapshot: profileSnapshotSchema,

    // ── Cancellation ──────────────────────────────────────────────
    cancelledAt: { type: Date },
    cancellationReason: { type: String, trim: true },

    // ── Payment (server-authoritative) ───────────────────────────
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "failed"],
      default: "not_required",
    },
    amountPaid: { type: Number, default: 0, min: 0 }, // snapshot of Event.price when charged
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },

    // ── Attendance — leader only; team members use TeamMember.qrToken ──
    qrToken: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex"), // unguessable, unhashed — one-time scan, not a login
    },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────

// One active registration per student per event.
// $in, not $ne — partialFilterExpression doesn't support $ne.
registrationSchema.index(
  { event: 1, student: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["confirmed", "waitlisted"] } } }
);

registrationSchema.index({ event: 1, status: 1 }); // registrant list by status
registrationSchema.index({ event: 1, createdAt: 1 }); // timeline analytics
registrationSchema.index({ student: 1 }); // "My Events"
registrationSchema.index({ student: 1, status: 1 }); // "My Events" filtered by status

// Sparse: unpaid registrations have no Razorpay id. Unique: no duplicate ids.
registrationSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
registrationSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

const Registration = mongoose.model("Registration", registrationSchema);
module.exports = Registration;
