const mongoose = require("mongoose");
const { Schema } = mongoose;

const achievementSchema = new Schema(
  {
    // Owner of this achievement.
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },

    issuer: { type: String, trim: true, maxlength: 200 },

    // External proof/verification page (e.g. AWS credential verifier,
    // event results page) — distinct from `certificate`, which is the
    // uploaded file itself.
    verificationLink: { type: String, trim: true, maxlength: 500 },

    // When it was actually earned (may differ from createdAt, the record date).
    dateEarned: {
      type: Date,
      validate: {
        validator: (value) => !value || value <= new Date(),
        message: "dateEarned cannot be in the future",
      },
    },

    // Optional proof of the achievement — image, PDF, or any other file type.
    // Same shape as User's profilePicture/profileBanner, so we can clean up
    // both the local and Cloudinary copies when it's replaced or removed.
    certificate: {
      filename: { type: String, trim: true, maxlength: 500 },
      cloudinaryUrl: { type: String },
      cloudinaryId: { type: String },
    },

    // No status/approval field on purpose: achievements are self-reported,
    // with no verification workflow.
  },
  { timestamps: true }
);

// Fetch a student's achievements, newest first — their profile page.
achievementSchema.index({ student: 1, createdAt: -1 });

const Achievement = mongoose.model("Achievement", achievementSchema);
module.exports = Achievement;
