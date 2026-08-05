const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    // Optional — a Post is an announcement that MAY reference an Event.
    // Querying "what's in Discover" stays a Post query; querying "what's
    // registrable" stays an Event query — this field is the only bridge
    // between the two, and it's one-directional (Post -> Event).
    event: { type: Schema.Types.ObjectId, ref: "Event" },

    content: { type: String, required: true, trim: true, maxlength: 3000 },

    // Small, fixed-shape, always fetched with the post — embedded rather
    // than referenced, per the project's embed/reference rule.
    images: [{ type: String, trim: true }], // Cloudinary URLs

    // Post-level tags — what the Discover filter UI and the interest-tag
    // ranking match against (distinct from Community.tags, which describes
    // the community itself rather than one specific announcement).
    tags: [{ type: String, trim: true, lowercase: true }],

    // Denormalized counters, cache-only — Comment and Like stay the source
    // of truth (comment/like history, per-user uniqueness checks, and any
    // future "who liked this" list all read from those collections, not
    // from these numbers). Kept in sync with an atomic $inc alongside every
    // Comment/Like create or delete, in the same service-layer call — not
    // a background job. Justified here specifically because Discover is
    // called out as the platform's highest-traffic read (Data Requirements
    // Brief §3.2): rendering a feed of post cards without these would mean
    // a countDocuments() per card. Drop both if you'd rather always
    // compute live.
    likesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// ── Indexes — all built around the Discover feed's actual query shape ──
// A community's own post history, latest first (community profile page).
// Also serves "posts from these followed communities, sorted by date"
// (Post.find({ community: { $in: [...] } }).sort({ createdAt: -1 })) —
// Mongo can use a compound index's trailing field for sort even when the
// leading field is an $in.
postSchema.index({ community: 1, createdAt: -1 });
// Tag filter (Discover filter UI) + interest-tag ranking match.
postSchema.index({ tags: 1 });
// Global feed default sort / date filter when not scoped to specific communities.
postSchema.index({ createdAt: -1 });
// Discover search bar.
postSchema.index({ content: "text" });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
