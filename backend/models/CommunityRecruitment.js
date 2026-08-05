const mongoose = require("mongoose");
const { Schema } = mongoose;
// Shared with Event — see formQuestion.schema.js for why.
const formQuestionSchema = require("./formQuestion.schema");

const communityRecruitmentSchema = new Schema(
  {
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    // The position name — copied onto CommunityMembership.label when an
    // applicant is selected (service-layer side effect, not enforced here).
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },

    formQuestions: [formQuestionSchema],

    // Optional recruitment drive cutoff date (checked on submission: isOpen && (!deadline || now <= deadline))
    deadline: { type: Date },

    // Gates whether new CommunityApplication documents can be created —
    // not just an archival flag. An Organizer flips this to false once a
    // position is filled or no longer accepting applicants.
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A community's own recruitment drives — this is how they surface on
// CommunityDetailPage, most recent first, typically filtered to isOpen.
communityRecruitmentSchema.index({ community: 1, isOpen: 1, createdAt: -1 });

// Virtual getter to check if recruitment drive is currently open & deadline has not passed.
communityRecruitmentSchema.virtual("isAcceptingApplications").get(function () {
  return this.isOpen && (!this.deadline || new Date() <= this.deadline);
});
communityRecruitmentSchema.set("toJSON", { virtuals: true });
communityRecruitmentSchema.set("toObject", { virtuals: true });

const CommunityRecruitment = mongoose.model(
  "CommunityRecruitment",
  communityRecruitmentSchema
);
module.exports = CommunityRecruitment;
