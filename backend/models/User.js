const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Schema } = mongoose;

// Fixed department list — enum, not free text, because branch is the
// analytics engine's core grouping dimension (Data Requirements Brief §3.1 / §8).
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
const ACADEMIC_YEAR_ROLLOVER_MONTH = 5; // June (Date.getMonth() is 0-indexed)

/**
 * The academic "cutover year" — flips every June 1st.
 * e.g. Feb 2026 -> cutover 2025 (still inside the "2025-26" academic year)
 *      Aug 2026 -> cutover 2026 (the "2026-27" academic year has begun)
 */
function getAcademicCutoverYear(referenceDate = new Date()) {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  return month >= ACADEMIC_YEAR_ROLLOVER_MONTH ? year : year - 1;
}

/**
 * Derives a student's current year (1-4; 5+ effectively means graduated)
 * from yearOfJoining. Computed on demand — nothing is ever stored or
 * batch-updated, so it can never drift out of sync.
 */
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
      match: [URL_REGEX, "Please provide a valid URL"],
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    // ── Identity / login ──────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
    // select: false at the schema level = never returned unless a query
    // explicitly opts in with .select('+password') — defense in depth.
    password: { type: String, required: true, select: false, minlength: 8 },

    createdAt: {
      type: Date,
      default: Date.now,
    },

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

    // Source of truth for "year" — see computeCurrentYear() above.
    // This is the ONLY year-related field stored on the document.
    yearOfJoining: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 2015 && v <= new Date().getFullYear();
        },
        message: "yearOfJoining must be a realistic year, not in the future",
      },
    },

    // ── Discover personalization ──────────────────────────────
    interestTags: [{ type: String, trim: true, lowercase: true }],

    // ── Profile ─────────────────────────────────────────────────
    avatar: {
      type: String,
      trim: true,
      match: [URL_REGEX, "Please provide a valid URL"],
    },
    bio: { type: String, trim: true, maxlength: 300 },
    skills: [{ type: String, trim: true }],
    education: [{ type: String, trim: true }],
    socialLinks: [socialLinkSchema],
    followerCount: { type: Number, default: 0, min: 0 },

    // Reserved for future use — see PRD §4.3 (student suspension, future scope)
    isSuspended: { type: Boolean, default: false },

    // ── Forgot password ─────────────────────────────────────────
    // Only the HASH of the reset token is stored. The raw token is what's
    // emailed to the student and never touches the database — so a DB
    // leak alone can't be used to reset anyone's password.
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────
// {branch, yearOfJoining}: every analytics query filters/groups on both
// together (Data Requirements Brief §3.9 — "make sure {branch, year} is
// properly indexed on User").
userSchema.index({ branch: 1, yearOfJoining: 1 });
// Multikey index — hit on every Discover feed load (tag-match join, §3.2).
userSchema.index({ interestTags: 1 });
// email / rollNo / prnNo already get unique indexes automatically from `unique: true`.

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

// ── Password hashing ─────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  // this.password is only present if the query explicitly did .select('+password')
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Forgot password ───────────────────────────────────────────────
// Generates the raw token (email THIS one, never store it), stores only
// its SHA-256 hash + a 15-minute expiry. Service layer clears both fields
// after a successful reset, making the token single-use.
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetTokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return rawToken;
};

// ── Static helpers (used by controllers / analytics pipelines) ─────
userSchema.statics.getAcademicCutoverYear = getAcademicCutoverYear;
userSchema.statics.computeCurrentYear = computeCurrentYear;

// Inverse of computeCurrentYear — turns "give me 2nd years" into the
// yearOfJoining value to query on, so filtering is a plain indexed
// equality check rather than a computed-field scan.
userSchema.statics.yearOfJoiningFor = function (currentYear, referenceDate) {
  const cutover = getAcademicCutoverYear(referenceDate);
  return cutover - currentYear + 1;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
