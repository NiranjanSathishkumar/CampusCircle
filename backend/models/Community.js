const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Schema } = mongoose;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const communitySchema = new Schema(
  {
    // ── Profile ───────────────────────────────────────────────
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, maxlength: 1000 },
    logo: {
      type: String,
      trim: true,
      match: [URL_REGEX, "Please provide a valid URL"],
    }, // Cloudinary URL
    banner: {
      type: String,
      trim: true,
      match: [URL_REGEX, "Please provide a valid URL"],
    }, // Cloudinary URL — CommunityHeroBanner

    // Matched against a student's interestTags for Discover ranking, and
    // used by the Community listing page's filter UI.
    tags: [{ type: String, trim: true, lowercase: true }],

    // Every community is manually vetted by Admin at creation. Stored as
    // a real (revocable) flag rather than assumed-always-true, so a
    // future non-vetted creation path can't silently inherit the badge.
    isVerified: { type: Boolean, default: true },

    // Soft-delete flag. Resolves the open question in the Data
    // Requirements Brief §6 ("communities that go inactive") — nothing is
    // hard-deleted; an inactive community is excluded from Discover/
    // listing queries and can be reactivated later.
    isActive: { type: Boolean, default: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },

    // Optional, not requested by any doc — a denormalized counter kept in
    // sync with an atomic $inc/$dec alongside every Follow create/delete
    // for this community (service layer, not a cron job). Avoids a
    // countDocuments() on Follow for every card on a Discover/listing
    // page. The actual follower list and the "growth over time" chart
    // still read from the Follow collection itself — this field is
    // display-only. Drop it if you'd rather always compute it live.
    followerCount: { type: Number, default: 0, min: 0 },

    // ── Shared organizer login (one login per community, 3–8 people) ──
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
    password: { type: String, required: true, select: false, minlength: 8 },

    // ── Forgot password — identical pattern to User ─────────────
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────
// Almost every listing/Discover query filters isActive:true, often
// combined with a tag match — this compound index covers both the
// isActive-only case (as a prefix) and the isActive+tags case.
communitySchema.index({ isActive: 1, tags: 1 });
// Community search bar (CommunityFilters.js)
communitySchema.index({ name: "text", description: "text" });
// name and email already get unique indexes automatically from `unique: true`

// ── Password hashing (identical pattern to User) ──────────────────
communitySchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

communitySchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

communitySchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetTokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return rawToken;
};

const Community = mongoose.model("Community", communitySchema);
module.exports = Community;
