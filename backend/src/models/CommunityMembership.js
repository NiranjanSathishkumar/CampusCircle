const mongoose = require("mongoose");
const { Schema } = mongoose;

// A student's membership in a Community, plus the Organizer-assigned label
// (role/position) for that membership.
const communityMembershipSchema = new Schema(
  {
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Free-text, deliberately not an enum — assigned by the Organizer,
    // informational only, no permission changes. Defaults to plain
    // "Member" until the Organizer gives them a posting.
    label: { type: String, required: true, trim: true, default: "Member" },

    // When this membership started. timestamps.createdAt tracks the same
    // moment technically, but this is the semantic field analytics/UI
    // should read.
    joinedAt: { type: Date, default: Date.now },

    // When the current label was last set — i.e. when they were given
    // their posting. Updated on every label change, not just the first.
    labelAssignedAt: { type: Date, default: Date.now },

    // Traceability only, optional. Set when this membership was created
    // by the CommunityApplication-selection side effect; left unset when
    // an Organizer adds/edits the roster directly.
    application: { type: Schema.Types.ObjectId, ref: "CommunityApplication" },

    // Soft-delete — keeps membership a historical record instead of
    // disappearing on removal.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Track label changes so labelAssignedAt only updates on an actual posting change.
communityMembershipSchema.pre("save", function () {
  if (!this.isNew && this.isModified("label")) {
    this.labelAssignedAt = new Date();
  }
});

// ── Indexes ───────────────────────────────────────────────────────

// One active membership per student per community — partial, so a removed
// (isActive: false) member can be re-added later without deleting the
// historical record.
communityMembershipSchema.index(
  { community: 1, student: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

// Organizer's roster view for their own community.
communityMembershipSchema.index({ community: 1, isActive: 1 });

// A student's own membership list across communities.
communityMembershipSchema.index({ student: 1, isActive: 1 });

const CommunityMembership = mongoose.model("CommunityMembership", communityMembershipSchema);
module.exports = CommunityMembership;
