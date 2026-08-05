const mongoose = require("mongoose");
const { Schema } = mongoose;
// Shared with Registration — see answer.schema.js for why.
const answerSchema = require("./answer.schema");

const communityApplicationSchema = new Schema(
  {
    recruitment: {
      type: Schema.Types.ObjectId,
      ref: "CommunityRecruitment",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Defaults to "pending" — unlike Registration.status, there's no
    // real-time capacity check to resolve at creation time, so a plain
    // default is correct here rather than forcing an explicit value.
    status: {
      type: String,
      enum: ["pending", "selected", "rejected"],
      default: "pending",
    },

    answers: [answerSchema],

    // NOTE (service layer, not enforced here): when an Organizer sets
    // status to "selected", a CommunityMembership record must be created
    // automatically, with this recruitment's title as its label. Nothing
    // in this schema guarantees that happens — see Data Requirements
    // Brief §3.5.
  },
  { timestamps: true }
);

// A student can't submit a second application to the same drive.
// Deliberately a PLAIN unique index, not partial like Registration's —
// nothing in the docs describes a withdraw-and-reapply flow, and a
// rejected application isn't equivalent to a cancelled registration.
communityApplicationSchema.index(
  { recruitment: 1, student: 1 },
  { unique: true }
);

// Organizer's application review queue for one drive: filter by status,
// oldest first.
communityApplicationSchema.index({ recruitment: 1, status: 1, createdAt: 1 });

// "My Applications" page — a student's application history, newest first.
communityApplicationSchema.index({ student: 1, createdAt: -1 });

const CommunityApplication = mongoose.model(
  "CommunityApplication",
  communityApplicationSchema
);
module.exports = CommunityApplication;
