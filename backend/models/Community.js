const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Schema } = mongoose;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

// Default banner, shown until the community uploads its own
const DEFAULT_COMMUNITY_BANNER = "https://alkuwaiti.com/wp-content/uploads/2020/05/Hero-Banner-Placeholder-Dark-1024x480.png";

module.exports.DEFAULT_COMMUNITY_BANNER = DEFAULT_COMMUNITY_BANNER;

const socialLinkSchema = new Schema(
  {
    platform: {
      type: String,
      enum: ["github", "linkedin", "discord", "instagram", "twitter"],
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
  },
  { _id: false },
);

const coreTeamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 128 },
    role: { type: String, required: true, trim: true, maxlength: 128 },
    avatar: { type: String, trim: true, maxlength: 500 },
    linkedin: {
      type: String,
      trim: true,
      maxlength: 500,
      match: [URL_REGEX, "Please provide a valid URL"],
    },
    github: {
      type: String,
      trim: true,
      maxlength: 500,
      match: [URL_REGEX, "Please provide a valid URL"],
    },
  },
  { _id: false },
);

const communitySchema = new Schema(
  {
    // ── Profile ───────────────────────────────────────────────
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
      type: String,
      trim: true,
      maxlength: 500,
    },

    banner: {
      type: String,
      trim: true,
      maxlength: 500,
      default: DEFAULT_COMMUNITY_BANNER,
    }, 

    role: { type: String, enum: ["organizer"], default: "organizer", immutable: true },
    
    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "tags cannot exceed 20 tags",
      },
    },

    category: { type: String, required: true, trim: true, maxlength: 60 },

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

    // Every community is manually vetted by Admin at creation
    isVerified: { type: Boolean, default: true },

    // Soft-delete flag
    isActive: { type: Boolean, default: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },

    // Maintained by Follow model hooks — never set directly in controllers
    followerCount: { type: Number, default: 0, min: 0 },

    // ── Recruiting ────────────────────────────────────────────
    isRecruiting: { type: Boolean, default: false },
    openRoles: {
      type: [{ type: String, trim: true, maxlength: 60 }], // e.g. "ML Research Interns"
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "openRoles cannot exceed 10 entries",
      },
    },

    // ── Leadership ────────────────────────────────────────────
    // Free-text summary shown in the sidebar (e.g. "Dr. Aris Thorne & Team")
    leadOrganizer: { type: String, trim: true, maxlength: 128 },

    coreTeam: {
      type: [coreTeamMemberSchema],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: "coreTeam cannot exceed 50 members",
      },
    },

    // ── Official Connect Channels ────────────────────────────
    socialLinks: {
      type: [socialLinkSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "socialLinks cannot exceed 10 entries",
      },
    },

    // ── FAQs ──────────────────────────────────────────────────
    faqs: {
      type: [faqSchema],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "faqs cannot exceed 20 entries",
      },
    },

    // ── Shared organizer login (one login per community, 3–8 people) ──
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
      maxlength: 200,
    },

    // Hidden by default; only returned via .select('+password')
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
      maxlength: 128,
    },

    // ── Forgot password ─────────────────────────────────────────
    // Only the hash is stored; the raw token is emailed and never saved
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────────────────────────────
// Almost every listing/Discover query filters isActive:true, often
// combined with a tag match — this compound index covers both the
// isActive-only case (as a prefix) and the isActive+tags case.
communitySchema.index({ isActive: 1, tags: 1 });
// Filter chips on the Communities listing page
communitySchema.index({ isActive: 1, category: 1 });
// Community search bar (CommunityFilters.js)
communitySchema.index({ name: "text", description: "text" });
// name and email already get unique indexes automatically from `unique: true`


// ── Forgot password ───────────────────────────────────────────────
// Returns the raw token (send by email); stores only its hash + a 15-min expiry
communitySchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetTokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return rawToken;
};

const Community = mongoose.model("Community", communitySchema);
module.exports = Community;