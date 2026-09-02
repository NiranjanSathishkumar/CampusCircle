const mongoose = require("mongoose");
const { Schema } = mongoose;
// Shared with CommunityRecruitment — see FormQuestion.schema.js for why.
const formQuestionSchema = require("./FormQuestion.schema");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fixed catalog the organizer create-event wizard and the student Events Hub
// both filter/badge by — kept here so validators can't drift from the model.
const EVENT_CATEGORIES = ["Workshop", "Competition", "Seminar", "Cultural", "Sports", "Tech Talk"];

// draft: only visible to the owning organizer, never returned by the public
// listEvents/getEvent paths. published: live and discoverable (subject to
// isActive, the separate soft-delete flag).
const EVENT_STATUSES = ["draft", "published"];

const teamSizeSchema = new Schema(
  {
    min: { type: Number, min: 1 },
    max: { type: Number, min: 1 },
  },
  { _id: false }
);

// EventAgendaTimeline — sequential phases shown on the student listing.
const agendaItemSchema = new Schema(
  {
    phase: { type: String, required: true, trim: true, maxlength: 150 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    desc: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

// EventFaqSection.
const faqItemSchema = new Schema(
  {
    q: { type: String, required: true, trim: true, maxlength: 300 },
    a: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

// EventContactSection — who to reach out to about this specific event.
// Distinct from Community's own contact info: this is per-event, set by
// whoever is coordinating that particular listing.
const contactCardSchema = new Schema(
  {
    leadName: { type: String, trim: true, maxlength: 150 },
    leadRole: { type: String, trim: true, maxlength: 150 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
    phone: { type: String, trim: true, maxlength: 20 },
    deskLocation: { type: String, trim: true, maxlength: 200 },
    building: { type: String, trim: true, maxlength: 100 },
    room: { type: String, trim: true, maxlength: 100 },
    floor: { type: String, trim: true, maxlength: 100 },
    emailSLA: { type: String, trim: true, maxlength: 150 },
    operatingHours: { type: String, trim: true, maxlength: 150 },
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
    category: { type: String, enum: EVENT_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    // Cloudinary asset — EventHeroBanner. cloudinaryId/filename are kept
    // alongside the url so uploadBanner/removeBanner can deleteEverywhere()
    // the old asset instead of orphaning it in Cloudinary on every replace.
    bannerImage: {
      url: { type: String, trim: true },
      cloudinaryId: { type: String, trim: true },
      filename: { type: String, trim: true },
    },
    venue: { type: String, required: true, trim: true }, // physical location or online link/description

    eventDate: { type: Date, required: true },
    eventEndDate: { type: Date },
    registrationDeadline: { type: Date },

    contact: contactCardSchema,

    // EventAgendaTimeline, EventRulesSection, EventFaqSection — purely
    // informational student-facing content, no bearing on registration logic.
    agenda: [agendaItemSchema],
    rules: [{ type: String, trim: true, maxlength: 300 }],
    faqs: [faqItemSchema],

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

    // ── Registration settings ────────────────────────────────────
    // Whether the registration form should also collect the registrant's
    // profile data (branch, year, etc.) alongside the custom formQuestions.
    collectProfileData: { type: Boolean, default: false },

    // If true, a student who registers once capacity is full is set to
    // "waitlisted" (see Registration.status) instead of being rejected.
    allowWaitlist: { type: Boolean, default: true },

    requireWaiver: { type: Boolean, default: false },
    // Required only when requireWaiver === true — enforced below.
    waiverText: { type: String, trim: true, maxlength: 2000 },

    // Shown to the student right after a successful registration.
    confirmationMessage: { type: String, trim: true, maxlength: 500 },
    sendEmailReceipt: { type: Boolean, default: false },

    formQuestions: [formQuestionSchema],

    // Atomic capacity gate — see chat note for the findOneAndUpdate +
    // $expr/$size pattern this enables. Authoritative source of truth for
    // "is this event full"; Registration.status mirrors it for display.
    confirmedRegistrationIds: [
      { type: Schema.Types.ObjectId, ref: "Registration" },
    ],

    // Denormalized display cache — Like is the source of truth, kept in
    // sync via an atomic $inc on every like/unlike.
    likesCount: { type: Number, default: 0, min: 0 },

    // Engagement funnel counters (organizer analytics) — fire-and-forget
    // beacons incremented by the student-facing detail view / registration
    // dialog, no per-student dedupe (every view/attempt counts, like a
    // page-view metric, not a toggleable reaction).
    viewCount: { type: Number, default: 0, min: 0 },
    registrationStartedCount: { type: Number, default: 0, min: 0 },

    // Soft-delete flag — same resolution as Community.isActive, extended
    // here per Data Requirements Brief §6 ("old events").
    isActive: { type: Boolean, default: true },

    // Publish gate, independent of isActive: a draft is a real saved
    // document (so the organizer's studio can list/edit it) but must never
    // surface through the public listEvents/getEvent paths. Publishing is a
    // one-way status change made via PATCH /:eventId.
    status: { type: String, enum: EVENT_STATUSES, default: "draft" },

    // Auto-delete timeline, set by the community only. Counted from the
    // event's own completion (eventEndDate, or eventDate for a single-day
    // event) — not from creation, so an event never expires before it has
    // even happened. Defaults to 1 month after completion, capped at 12 for
    // communities that want a longer retention window. expiresAt is derived
    // from this and recomputed whenever it or the event's dates change; a
    // background job (jobs/autoDeleteContent.job.js) soft-deletes
    // (isActive: false) events past expiresAt — same effect as deleteEvent.
    // The community can still soft-delete an event outright at any time via
    // DELETE /:eventId regardless of this timeline.
    autoDeleteAfterMonths: { type: Number, min: 1, max: 12, default: 1 },
    expiresAt: { type: Date, required: true },

    // Which "event coming up soon" reminders jobs/eventReminder.job.js has
    // already fanned out to everyone registered - "2d" (48h-24h before) and
    // "1d" (24h-0h before), each sent at most once. Cleared below whenever
    // the event is rescheduled so a moved event reminds again for its new
    // date.
    remindersSent: { type: [String], enum: ["2d", "1d"], default: [] },
  },
  { timestamps: true }
);

// team-type events must specify a valid team size — enforced at the
// schema level rather than left to the application layer.
// Uses invalidate() rather than throw: a thrown Error from a pre-validate
// hook bypasses Mongoose's ValidationError aggregation entirely (it isn't
// wrapped), so controllers checking `err.name === "ValidationError"` would
// fall through to a generic 500 instead of the intended 400.
eventSchema.pre("validate", function () {
  if (this.registrationType === "team") {
    if (!this.teamSize || !this.teamSize.min || !this.teamSize.max) {
      this.invalidate(
        "teamSize",
        'teamSize.min and teamSize.max are required when registrationType is "team"'
      );
    } else if (this.teamSize.min > this.teamSize.max) {
      this.invalidate("teamSize", "teamSize.min cannot exceed teamSize.max");
    }
  }

  if (this.requireWaiver && !this.waiverText) {
    this.invalidate("waiverText", "waiverText is required when requireWaiver is true");
  }

  if (this.registrationDeadline && this.registrationDeadline > this.eventDate) {
    this.invalidate("registrationDeadline", "registrationDeadline cannot be after eventDate");
  }

  if (this.eventEndDate && this.eventEndDate < this.eventDate) {
    this.invalidate("eventEndDate", "eventEndDate cannot be before eventDate");
  }

  // A rescheduled event should get fresh reminders for its new date rather
  // than staying silent because the old date already sent them.
  if (!this.isNew && (this.isModified("eventDate") || this.isModified("eventEndDate"))) {
    this.remindersSent = [];
  }

  // Recompute expiresAt — anchored to the event's own completion date, not
  // creation — whenever the event is new, the timeline was changed, the
  // event was rescheduled (eventDate/eventEndDate), or expiresAt is missing
  // (a document saved before this field existed — schema defaults apply to
  // autoDeleteAfterMonths on hydration but aren't marked "modified", so
  // without this fallback such a document would fail validation forever
  // with "expiresAt is required").
  if (
    this.isNew ||
    this.isModified("autoDeleteAfterMonths") ||
    this.isModified("eventDate") ||
    this.isModified("eventEndDate") ||
    !this.expiresAt
  ) {
    const base = this.eventEndDate || this.eventDate;
    const expiresAt = new Date(base);
    expiresAt.setMonth(expiresAt.getMonth() + this.autoDeleteAfterMonths);
    this.expiresAt = expiresAt;
  }
});

// ── Indexes ──────────────────────────────────────────────────────
// Events page default view: active, published events, filterable/sortable by date.
eventSchema.index({ isActive: 1, status: 1, eventDate: 1 });
// A community's own event history (organizer dashboard "my events").
eventSchema.index({ community: 1, eventDate: -1 });
// EventFilters tag filter.
eventSchema.index({ tags: 1 });
// Events page search bar.
eventSchema.index({ title: "text", description: "text" });
// Auto-delete sweep (jobs/autoDeleteContent.job.js queries expiresAt <= now).
eventSchema.index({ expiresAt: 1 });

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
module.exports.EVENT_CATEGORIES = EVENT_CATEGORIES;
module.exports.EVENT_STATUSES = EVENT_STATUSES;
