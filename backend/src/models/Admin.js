const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Schema } = mongoose;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
    password: { type: String, required: true, select: false, minlength: 8, maxlength: 72 },

    role: { type: String, enum: ["admin"], default: "admin", immutable: true },

    // ── Forgot password — identical pattern to User/Community ──
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ── Refresh tokens ──
    // Active session tokens, oldest first; capped per role (see
    // utils/sessionLimits.js), rotated in place on /refresh, pruned on /logout.
    refreshTokens: { type: [String], select: false, default: [] },
  },
  { timestamps: true },

);

// No indexes beyond the automatic unique index on `email`. This collection
// is never filtered, sorted, or grouped on anything — a handful of
// accounts total, not part of the analytics engine.

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generates the raw token (email THIS one, never store it), stores only
// its SHA-256 hash + a 15-minute expiry. Service layer clears both fields
// after a successful reset, making the token single-use.
adminSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetTokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return rawToken;
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
