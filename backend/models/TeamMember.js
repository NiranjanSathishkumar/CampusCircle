const mongoose = require("mongoose");
const crypto = require("crypto");
const { Schema } = mongoose;

// Represents an ADDITIONAL member on a team — the leader is not
// duplicated here, they're already Registration.student.
const teamMemberSchema = new Schema(
  {
    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Denormalized from registration.event. Deliberate write-time
    // duplication — see the {event, student} index below, which is the
    // entire reason this field exists.
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },

    // Same pattern as Registration.qrToken — auto-generated, unhashed,
    // globally unique, looked up directly at scan time.
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

// The cross-collection uniqueness check the brief calls for: a student
// can only be on ONE team for a given event. Without the denormalized
// `event` field above, this would require a join through Registration on
// every team-add — with it, it's a single indexed unique check.
teamMemberSchema.index({ event: 1, student: 1 }, { unique: true });

// Fetch a team's full member roster — team display, scan-in flow.
teamMemberSchema.index({ registration: 1 });

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
module.exports = TeamMember;
