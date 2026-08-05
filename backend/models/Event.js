const mongoose = require("mongoose");
const { Schema } = mongoose;
// Shared with CommunityRecruitment — see formQuestion.schema.js for why.
const formQuestionSchema = require("./formQuestion.schema");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const teamSizeSchema = new Schema(
  {
    min: { type: Number, min: 1 },
    max: { type: Number, min: 1 },
  },
  { _id: false }
);

const eventSchema = new Schema(
  {
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    bannerImage: { type: String, trim: true }, // Cloudinary URL — EventHeroBanner
    venue: { type: String, required: true, trim: true }, // physical location or online link/description

    eventDate: { type: Date, required: true },
    eventEndDate: { type: Date },
    registrationDeadline: { type: Date },

    // EventContactSection — who to reach out to about this specific event
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
    contactPhone: { type: String, trim: true },

    // EventFilters — same filter/personalization role as Post.tags
    tags: [{ type: String, trim: true, lowercase: true }],

    registrationType: { type: String, enum: ["solo", "team"], required: true },
    // Required only when registrationType === "team" — enforced below.
    teamSize: teamSizeSchema,

    // Counts registration SLOTS (a team occupies one slot regardless of
    // size), matching "a registration is one document per solo entry or
    // per team." Confirmed max per product decision: 1000.
    capacity: { type: Number, required: true, min: 1, max: 1000 },

    // Authoritative price — the ONLY value the payment-order route may
    // use when building a Razorpay order. Never accept a price/amount
    // from client request bodies.
    price: { type: Number, required: true, default: 0, min: 0 },

    formQuestions: [formQuestionSchema],

    // Atomic capacity gate — see chat note for the findOneAndUpdate +
    // $expr/$size pattern this enables. Authoritative source of truth for
    // "is this event full"; Registration.status mirrors it for display.
    confirmedRegistrationIds: [
      { type: Schema.Types.ObjectId, ref: "Registration" },
    ],

    // Soft-delete flag — same resolution as Community.isActive, extended
    // here per Data Requirements Brief §6 ("old events").
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// team-type events must specify a valid team size — enforced at the
// schema level rather than left to the application layer.
eventSchema.pre("validate", function (next) {
  if (this.registrationType === "team") {
    if (!this.teamSize || !this.teamSize.min || !this.teamSize.max) {
      return next(
        new Error(
          'teamSize.min and teamSize.max are required when registrationType is "team"'
        )
      );
    }
    if (this.teamSize.min > this.teamSize.max) {
      return next(new Error("teamSize.min cannot exceed teamSize.max"));
    }
  }

  if (this.registrationDeadline && this.registrationDeadline > this.eventDate) {
    return next(
      new Error("registrationDeadline cannot be after eventDate")
    );
  }

  if (this.eventEndDate && this.eventEndDate < this.eventDate) {
    return next(new Error("eventEndDate cannot be before eventDate"));
  }

  next();
});

// ── Indexes ──────────────────────────────────────────────────────
// Events page default view: active events, filterable/sortable by date.
eventSchema.index({ isActive: 1, eventDate: 1 });
// A community's own event history (organizer dashboard "my events").
eventSchema.index({ community: 1, eventDate: -1 });
// EventFilters tag filter.
eventSchema.index({ tags: 1 });
// Events page search bar.
eventSchema.index({ title: "text", description: "text" });

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
