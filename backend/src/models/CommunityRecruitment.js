const mongoose = require("mongoose");
const { Schema } = mongoose;
// Shared with Event — see FormQuestion.schema.js for why.
const formQuestionSchema = require("./FormQuestion.schema");

const communityRecruitmentSchema = new Schema(
  {
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },

    // The position name — copied onto CommunityMembership.label when an
    // applicant is selected (service-layer side effect, not enforced here).
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },

    formQuestions: [formQuestionSchema],

    // Optional cutoff date — checked on submission via isAcceptingApplications.
    deadline: { type: Date },

    // ── Application settings ─────────────────────────────────────
    // Whether the application form should also collect the applicant's
    // profile data (branch, year, etc.) alongside the custom formQuestions.
    collectProfileData: { type: Boolean, default: false },

    requireWaiver: { type: Boolean, default: false },
    // Required only when requireWaiver === true — enforced below.
    waiverText: { type: String, trim: true, maxlength: 2000 },

    // Shown to the applicant right after a successful application.
    confirmationMessage: { type: String, trim: true, maxlength: 500 },
    sendEmailReceipt: { type: Boolean, default: false },

    // Gates whether new CommunityApplication documents can be created —
    // not just an archival flag. An Organizer flips this to false once a
    // position is filled or no longer accepting applicants.
    isOpen: { type: Boolean, default: true },

    // Soft-delete flag — same resolution as Event.isActive. A deleted drive
    // stays isOpen's own value untouched; isAcceptingApplications gates on
    // both so a deleted-but-still-"open" drive can't take new applications.
    isActive: { type: Boolean, default: true },

    // Auto-delete timeline, set by the community only. Defaults to 6 months,
    // capped at 12. expiresAt is derived from this and recomputed whenever it
    // changes; a background job (jobs/autoDeleteContent.job.js) soft-deletes
    // (isActive: false) drives past expiresAt — same effect as deleteDrive.
    // The community can still delete a drive outright at any time via
    // DELETE /drives/:recruitmentId regardless of this timeline.
    autoDeleteAfterMonths: { type: Number, min: 1, max: 12, default: 6 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

communityRecruitmentSchema.pre("validate", function () {
  if (this.requireWaiver && !this.waiverText) {
    this.invalidate("waiverText", "waiverText is required when requireWaiver is true");
  }

  // Recompute expiresAt from autoDeleteAfterMonths whenever the drive is new,
  // the timeline was changed, or expiresAt is missing (a document saved before
  // this field existed — schema defaults apply to autoDeleteAfterMonths on
  // hydration but aren't marked "modified", so without this fallback such a
  // document would fail validation forever with "expiresAt is required").
  // New drives anchor to "now" rather than this.createdAt, since mongoose's
  // timestamps handling hasn't run yet.
  //
  // Also recompute (anchored to "now") when an organizer restores a drive
  // that the auto-delete sweep (jobs/autoDeleteContent.job.js) already
  // soft-deleted for being past its old expiresAt — that sweep runs a plain
  // updateMany and never touches this hook, so without this branch the old,
  // already-past expiresAt would survive the restore untouched and the very
  // next hourly sweep would immediately soft-delete it again.
  const restoringPastExpiry =
    this.isModified("isActive") && this.isActive && this.expiresAt && this.expiresAt <= new Date();

  if (this.isNew || this.isModified("autoDeleteAfterMonths") || !this.expiresAt || restoringPastExpiry) {
    const base = this.isNew || restoringPastExpiry ? new Date() : this.createdAt;
    const expiresAt = new Date(base);
    expiresAt.setMonth(expiresAt.getMonth() + this.autoDeleteAfterMonths);
    this.expiresAt = expiresAt;
  }
});

// A community's own recruitment drives — this is how they surface on
// CommunityDetailPage, most recent first, typically filtered to isOpen.
communityRecruitmentSchema.index({ community: 1, isOpen: 1, createdAt: -1 });

// Auto-delete sweep (jobs/autoDeleteContent.job.js queries expiresAt <= now).
communityRecruitmentSchema.index({ expiresAt: 1 });

// Whether the drive is currently open and its deadline hasn't passed.
communityRecruitmentSchema.virtual("isAcceptingApplications").get(function () {
  return this.isActive && this.isOpen && (!this.deadline || new Date() <= this.deadline);
});
communityRecruitmentSchema.set("toJSON", { virtuals: true });
communityRecruitmentSchema.set("toObject", { virtuals: true });

const CommunityRecruitment = mongoose.model("CommunityRecruitment", communityRecruitmentSchema);
module.exports = CommunityRecruitment;
