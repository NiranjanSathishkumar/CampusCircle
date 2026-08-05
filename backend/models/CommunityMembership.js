const mongoose = require("mongoose");
const { Schema } = mongoose;

const communityMembershipSchema = new Schema(
  {
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Free-text, deliberately not an enum — PRD: "Free-text member labels
    // assigned by Organizer (informational only, no permission changes)."
    label: { type: String, required: true, trim: true },

    // Traceability only, optional. Set when this membership was created
    // by the CommunityApplication-selection side effect; left unset when
    // an Organizer adds/edits the roster directly.
    application: { type: Schema.Types.ObjectId, ref: "CommunityApplication" },

    // Resolves an explicitly UNANSWERED question in the Data Requirements
    // Brief §8 ("removed/inactive state, or is deletion acceptable?").
    // Defaulted to the soft-delete convention used elsewhere
    // (Community.isActive, Event.isActive), so membership stays a
    // historical record rather than disappearing on removal. Confirm —
    // this one is genuinely open, not inferred from a stated decision.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One membership record per student per community — partial, so a
// removed (isActive: false) member can be re-added later without
// deleting the historical record. Same reasoning as Registration's
// cancellation index.
communityMembershipSchema.index(
  { community: 1, student: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// Organizer's roster view for their own community.
communityMembershipSchema.index({ community: 1, isActive: 1 });

// A student's own membership list across communities. Anticipated need
// rather than one evidenced by a named page — membership is inherently
// two-sided, so this is cheap to keep even if not yet used.
communityMembershipSchema.index({ student: 1, isActive: 1 });

const CommunityMembership = mongoose.model(
  "CommunityMembership",
  communityMembershipSchema
);
module.exports = CommunityMembership;
