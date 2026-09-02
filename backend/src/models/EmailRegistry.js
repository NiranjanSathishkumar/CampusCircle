const mongoose = require("mongoose");
const { Schema } = mongoose;

// Cross-role source of truth for email uniqueness. User, Community, and
// Admin each carry their own unique index on `email`, but a MongoDB unique
// index only ever enforces uniqueness within its own collection — it cannot
// stop the same email from being claimed once per collection at the same
// time. Every signup path reserves its email here first (see
// utils/ensureEmailUnique.reserveEmail): this collection's own unique index
// is what atomically arbitrates a single winner when two signups for
// different roles race on the same email.
const emailRegistrySchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: { type: String, enum: ["student", "organizer", "admin"], required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("EmailRegistry", emailRegistrySchema);
