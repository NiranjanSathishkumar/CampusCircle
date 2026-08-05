const mongoose = require("mongoose");
const { Schema } = mongoose;

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const achievementSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    // Free text — the external org/event/platform that issued it, e.g.
    // "Coursera", "Smart India Hackathon". Deliberately NOT a reference
    // to the Community collection — this is self-reported, not
    // organizer-awarded. See chat note on the doc conflict this resolves.
    issuer: { type: String, trim: true, maxlength: 200 },
    dateEarned: { type: Date }, // when it was actually earned, distinct from createdAt
    certificateImage: {
      type: String,
      trim: true,
      match: [URL_REGEX, "Please provide a valid URL"],
    }, // Cloudinary URL, optional proof

    // No status/approval field, deliberately. Explicitly self-reported,
    // no validation or approval workflow — not even a placeholder default
    // for a future verification feature, since adding that later is a
    // genuine schema change, not a toggle (Data Requirements Brief §3.7).
  },
  { timestamps: true }
);

// A student's own achievements section on their profile — the only
// access pattern this collection needs; not part of the analytics engine.
achievementSchema.index({ student: 1 });

const Achievement = mongoose.model("Achievement", achievementSchema);
module.exports = Achievement;
