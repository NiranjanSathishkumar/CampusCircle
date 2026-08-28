const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Schema } = mongoose;

const BRANCHES = [
  "Computer Engineering 1",
  "Computer Engineering 2",
  "Computer Engineering 3",
  "Information Technology 1",
  "Information Technology 2",
  "AI & Data Science",
  "AI & Machine Learning",
  "CSE (IoT, Cyber Security, & Blockchain)",
];

const COURSE_DURATION_YEARS = 4;
const ACADEMIC_YEAR_ROLLOVER_MONTH = 5; // June (0-indexed)

// Default images, shown until the user uploads their own
const DEFAULT_PROFILE_PICTURE = "https://ui-avatars.com/api/?name=User&background=random&color=fff&size=512";
const DEFAULT_PROFILE_BANNER = "https://alkuwaiti.com/wp-content/uploads/2020/05/Hero-Banner-Placeholder-Dark-1024x480.png";


// Academic year flips every June 1st
function getAcademicCutoverYear(referenceDate = new Date()) {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  return month >= ACADEMIC_YEAR_ROLLOVER_MONTH ? year : year - 1;
}

// Current year of study from joining year
function computeCurrentYear(yearOfJoining, referenceDate = new Date()) {
  return getAcademicCutoverYear(referenceDate) - yearOfJoining + 1;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const socialLinkSchema = new Schema(
  {
    platform: {
      type: String,
      enum: ["linkedin", "instagram", "github"],
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

const userSchema = new Schema(
  {
    // ── Identity / login ──────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 128,
    },

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

    role: { type: String, enum: ["student"], default: "student", immutable: true },

    // ── Academic identity ─────────────────────────────────────
    rollNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    prnNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    branch: { type: String, enum: BRANCHES },

    yearOfJoining: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 2015 && v <= new Date().getFullYear();
        },
        message: "yearOfJoining must be a realistic year, not in the future",
      },
    },

    // Auto-set true once email, rollNo, prnNo, branch, and yearOfJoining are filled
    isProfileComplete: { type: Boolean, default: false },

    // ── Discover personalization ──────────────────────────────
    interestTags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "interestTags cannot exceed 20 tags",
      },
    },

    // ── Profile ─────────────────────────────────────────────────
    profilePicture: {
      filename: { type: String, trim: true, maxlength: 500, default: DEFAULT_PROFILE_PICTURE },
      cloudinaryUrl: {type: String},
      cloudinaryId: {type: String},
    },

    profileBanner: {
      filename: { type: String, trim: true, maxlength: 500, default: DEFAULT_PROFILE_BANNER },
      cloudinaryUrl: {type: String},
      cloudinaryId: {type: String},
    },

    bio: { type: String, trim: true, maxlength: 300 },

    skills: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      validate: {
        validator: (arr) => arr.length <= 30,
        message: "skills cannot exceed 30 entries",
      },
    },

    education: {
      type: [{ type: String, trim: true, maxlength: 150 }],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "education cannot exceed 10 entries",
      },
    },

    socialLinks: {
      type: [socialLinkSchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "socialLinks cannot exceed 5 entries",
      },
    },

    // Maintained by Follow model hooks — never set directly in controllers
    followerCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },

    // Future scope
    isSuspended: { type: Boolean, default: false },
    // passwordChangedAt — to invalidate old JWTs issued before a reset

    // ── Forgot password ─────────────────────────────────────────
    // Only the hash is stored; the raw token is emailed and never saved
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ── Refresh token ─────────────────────────────────────────────
    // Current valid refresh token; overwritten on login, cleared on logout
    refreshToken: { type: String, select: false },
  },
  { timestamps: true },
);

// ── Indexes ──────────────────────────────────────────────────────
userSchema.index({ branch: 1, yearOfJoining: 1 });
userSchema.index({ interestTags: 1 });

// ── Virtuals ───────────────────────────────────────────────────────
userSchema.virtual("currentYear").get(function () {
  return computeCurrentYear(this.yearOfJoining);
});
userSchema.virtual("isEnrolled").get(function () {
  const yr = computeCurrentYear(this.yearOfJoining);
  return yr >= 1 && yr <= COURSE_DURATION_YEARS;
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// ── Auto-complete check ───────────────────────────────────────────
// Recomputes isProfileComplete before every save
userSchema.pre("save", function () {
  this.isProfileComplete = Boolean(
    this.email &&
      this.rollNo &&
      this.prnNo &&
      this.branch &&
      this.yearOfJoining,
  );
});

// ── Password comparison ───────────────────────────────────────────
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Forgot password ───────────────────────────────────────────────
// Returns the raw token (send by email); stores only its hash + a 15-min expiry
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetTokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return rawToken;
};

// ── Static helpers ─────────────────────────────────────────────
userSchema.statics.getAcademicCutoverYear = getAcademicCutoverYear;
userSchema.statics.computeCurrentYear = computeCurrentYear;

// Converts a "current year" filter into the matching yearOfJoining
userSchema.statics.yearOfJoiningFor = function (currentYear, referenceDate) {
  const cutover = getAcademicCutoverYear(referenceDate);
  return cutover - currentYear + 1;
};

const User = mongoose.model("User", userSchema);
module.exports = { User, DEFAULT_PROFILE_PICTURE, DEFAULT_PROFILE_BANNER };