const mongoose = require("mongoose");
const crypto = require("crypto");
const { Schema } = mongoose;
const answerSchema = require("./Answer.schema"); // shared with Registration/CommunityApplication

// An ADDITIONAL member on a team — the leader is Registration.student and
// is not duplicated here.
const teamMemberSchema = new Schema(
  {
    // ── Core ──────────────────────────────────────────────────────
    registration: { type: Schema.Types.ObjectId, ref: "Registration", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Denormalized from registration.event — the entire reason is the
    // {event, student} unique index below (avoids a join through
    // Registration on every team-add).
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },

    // Per-member answers to the event's formQuestions. Same shape and
    // `question` linkage as Registration.answers — a team event can need
    // each member to answer individually (t-shirt size, ID, etc), not
    // just the leader.
    answers: [answerSchema],

    // ── Invitation ────────────────────────────────────────────────
    // The leader adding a member only creates the invite — the invited
    // student must accept before they're a real part of the roster.
    // Declining deletes the doc outright (see teams.controller.js)
    // rather than keeping a "declined" row around, so the {event, student}
    // unique index doesn't block that student from joining a different
    // team for the same event afterward.
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    respondedAt: { type: Date },

    // ── Attendance ────────────────────────────────────────────────
    // Same pattern as Registration.qrToken — auto-generated, unhashed,
    // globally unique, looked up directly at scan time. A pending
    // (not-yet-accepted) member can't actually check in — see
    // checkin.controller.js's status gate.
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

// ── Indexes ───────────────────────────────────────────────────────

// A student can only be on ONE team per event.
teamMemberSchema.index({ event: 1, student: 1 }, { unique: true });

// Team roster fetch — team display, scan-in flow.
teamMemberSchema.index({ registration: 1 });

// A student's own team memberships across events.
teamMemberSchema.index({ student: 1 });

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
module.exports = TeamMember;
