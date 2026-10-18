const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Schema } = mongoose;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

// Default assets
const DEFAULT_COMMUNITY_LOGO = "https://ui-avatars.com/api/?name=Community&background=random&color=fff&size=512";
const DEFAULT_COMMUNITY_BANNER = "https://alkuwaiti.com/wp-content/uploads/2020/05/Hero-Banner-Placeholder-Dark-1024x480.png";


const COMMUNITY_SOCIAL_PLATFORMS = ["github", "linkedin", "discord", "instagram", "twitter"];

// Mirrors frontend/src/features/communities/communitiesConstants.js's
// COMMUNITY_CATEGORY_VALUES — kept in sync manually since the two apps don't
// share a package. This is the only place a community's category can come
// from (admin creation, organizer self-update); enforcing it here (and via
// the schema enum below) is what stops a value like "Technical" from ever
// landing in the database and silently falling out of every category filter
// tab, which is undiscoverable-by-category and has no dropdown option that
// would let an organizer fix it themselves.
const COMMUNITY_CATEGORIES = [
  "Technology & Development",
  "Arts & Culture",
  "Sports & Fitness",
  "Academic & Literary",
  "Social & Cultural",
];

const socialLinkSchema = new Schema(
  {
    platform: {
      type: String,
      enum: COMMUNITY_SOCIAL_PLATFORMS,
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
      match: [URL_REGEX, "Please provide a valid URL"],
    },
  },
  { _id: false },
);

const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 200 },
    answer: { type: String, required: true, trim: true, maxlength: 1000 },
  }
);

const roleHistoryEntrySchema = new Schema(
  {
    role: { type: String, required: true, trim: true, maxlength: 128 },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const coreTeamMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true, trim: true, maxlength: 128 },
    // Optional domain wing (e.g. 'Technical', 'Design', 'Finance')
    wing: { type: String, trim: true, maxlength: 60, default: null },
    // Set automatically when the member is added to the team
    joinedAt: { type: Date, default: Date.now },
    // Append-only log; latest entry is always the current role
    roleHistory: { type: [roleHistoryEntrySchema], default: [] },
  },
  { _id: false },
);

const communitySchema = new Schema(
  {
    // ── Profile ──
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 128,
    },

    description: { type: String, trim: true, maxlength: 1000 },

    logo: {
      filename: { type: String, trim: true, maxlength: 500, default: DEFAULT_COMMUNITY_LOGO },
      cloudinaryUrl: { type: String },
      cloudinaryId: { type: String },
    },

    banner: {
      filename: { type: String, trim: true, maxlength: 500, default: DEFAULT_COMMUNITY_BANNER },
      cloudinaryUrl: { type: String },
      cloudinaryId: { type: String },
    },

    role: { type: String, enum: ["organizer"], default: "organizer", immutable: true },

    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "tags cannot exceed 20 tags",
      },
    },

    category: { type: String, required: true, trim: true, maxlength: 60, enum: COMMUNITY_CATEGORIES },

    location: { type: String, trim: true },

    establishedYear: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 2000 && v <= new Date().getFullYear();
        },
        message: "establishedYear must be a realistic year, not in the future",
      },
    },

    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },

    // Maintained by Follow model hooks
    followerCount: { type: Number, default: 0, min: 0 },

    // ── Recruiting ──
    isRecruiting: { type: Boolean, default: false },
    openRoles: {
      type: [{ type: String, trim: true, maxlength: 60 }],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "openRoles cannot exceed 10 entries",
      },
    },

    // ── Leadership ──
    leadOrganizer: { type: String, trim: true, maxlength: 128 },

    coreTeam: {
      type: [coreTeamMemberSchema],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: "coreTeam cannot exceed 50 members",
      },
    },

    // ── Social Links ──
    socialLinks: {
      type: [socialLinkSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "socialLinks cannot exceed 10 entries",
      },
    },

    // ── FAQs ──
    faqs: {
      type: [faqSchema],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "faqs cannot exceed 20 entries",
      },
    },

    // ── Authentication ──
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
      maxlength: 200,
    },

    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
      maxlength: 72,
    },

    // ── Password Reset ──
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ── Refresh tokens ──
    // Active session tokens, oldest first; capped per role (see
    // utils/sessionLimits.js), rotated in place on /refresh, pruned on /logout.
    refreshTokens: { type: [String], select: false, default: [] },
  },
  { timestamps: true },
);

communitySchema.path("coreTeam").validate(function (arr) {
  const ids = arr.map((m) => m.user.toString());
  return new Set(ids).size === ids.length;
}, "A student cannot be added to the core team more than once");

// ── Indexes ──
communitySchema.index({ isActive: 1, tags: 1 });
communitySchema.index({ isActive: 1, category: 1 });
communitySchema.index({ name: "text", description: "text" });
// Discover Communities' default listing: filter isActive, sort by
// followerCount desc then name — without this, Mongo full-scans + sorts
// the collection in memory on every page load.
communitySchema.index({ isActive: 1, followerCount: -1, name: 1 });

// ── Password comparison ───────────────────────────────────────────
communitySchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate 15-min password reset token
communitySchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetTokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return rawToken;
};

// ── Password hashing ───────────────────────────────────────────────
communitySchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const Community = mongoose.model("Community", communitySchema);
module.exports = Community;
// Attached after the assignment above — setting them before it had no effect,
// since `module.exports = Community` replaced the whole exports object.
module.exports.DEFAULT_COMMUNITY_LOGO = DEFAULT_COMMUNITY_LOGO;
module.exports.DEFAULT_COMMUNITY_BANNER = DEFAULT_COMMUNITY_BANNER;
module.exports.COMMUNITY_SOCIAL_PLATFORMS = COMMUNITY_SOCIAL_PLATFORMS;
module.exports.COMMUNITY_CATEGORIES = COMMUNITY_CATEGORIES;