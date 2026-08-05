const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared by Event (registration forms) and CommunityRecruitment
// (application forms) — same dynamic-question shape for both, per Data
// Requirements Brief §3.5: "reuse the same formQuestions shape rather
// than inventing a second pattern for what's functionally the same
// problem." Kept as its own file so both models import the identical
// definition instead of two copies that could quietly drift apart.
const formQuestionSchema = new Schema({
  label: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["text", "number", "url", "image", "choice"],
    required: true,
  },
  required: { type: Boolean, default: true },
  // Only meaningful when type === "choice" — validated below.
  options: {
    type: [{ type: String, trim: true }],
    validate: {
      validator: function (opts) {
        if (this.type === "choice") return Array.isArray(opts) && opts.length >= 2;
        return true;
      },
      message: 'A "choice" question needs at least 2 options',
    },
  },
});

module.exports = formQuestionSchema;
