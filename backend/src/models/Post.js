const mongoose = require("mongoose");
const { Schema } = mongoose;

// A community announcement, optionally linked to an Event.
const postSchema = new Schema(
  {
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event" },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 3000 },

    // Draft vs live. Unpublished posts are excluded from every student-facing
    // read path (Discover feed, single-post fetch, community post history)
    // and never trigger a follower notification — only the owning
    // organizer can see their own drafts. See posts.controller.js.
    isPublished: { type: Boolean, default: true },

    // Drives the Discover feed's type badge/filter. Purely a display
    // categorization — has no effect on moderation or auto-delete behavior.
    type: {
      type: String,
      required: true,
      enum: ["Announcement", "Event", "Achievement", "Workshop", "Update", "Notice"],
      default: "Announcement",
    },

    // Images, videos, or documents (PDF/DOC/DOCX/PPT/PPTX). Mimetypes are
    // enforced by middleware/upload.js's uploadPostMedia, not here.
    attachments: [
      {
        url: { type: String, required: true, trim: true }, // Cloudinary URL
        cloudinaryId: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ["image", "video", "document"] },
        filename: { type: String, trim: true, maxlength: 255 },
      },
    ],

    // Matched by the Discover filter UI and interest-tag ranking.
    tags: [{ type: String, trim: true, lowercase: true }],

    // Denormalized display caches — Like/Comment stay the source of truth,
    // kept in sync with an atomic $inc on every create/delete.
    likesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },

    // Analytics only, incremented directly on read — no View collection.
    viewsCount: { type: Number, default: 0, min: 0 },

    // Auto-delete timeline, set by the community only (never the student side).
    // Defaults to 6 months, capped at 12. expiresAt is derived from this and
    // recomputed whenever it changes; a background job (jobs/autoDeletePosts.job.js)
    // sweeps posts past expiresAt. The community can still delete a post outright
    // at any time via DELETE /posts/:postId regardless of this timeline.
    autoDeleteAfterMonths: { type: Number, min: 1, max: 12, default: 6 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Recompute expiresAt from autoDeleteAfterMonths whenever the post is new,
// the timeline was changed, or expiresAt is missing (a document saved before
// this field existed — schema defaults apply to autoDeleteAfterMonths on
// hydration but aren't marked "modified", so without this fallback such a
// document would fail validation forever with "expiresAt is required").
// Runs pre-validate since expiresAt is required; new posts anchor to "now"
// rather than this.createdAt, since mongoose's timestamps handling hasn't
// run yet at this point.
postSchema.pre("validate", function () {
  if (this.isNew || this.isModified("autoDeleteAfterMonths") || !this.expiresAt) {
    const base = this.isNew ? new Date() : this.createdAt;
    const expiresAt = new Date(base);
    expiresAt.setMonth(expiresAt.getMonth() + this.autoDeleteAfterMonths);
    this.expiresAt = expiresAt;
  }
});

// ── Indexes ───────────────────────────────────────────────────────

// A community's post history, newest first. Also serves "posts from
// followed communities" since Mongo can use the trailing sort field
// even when the leading field is an $in.
postSchema.index({ community: 1, createdAt: -1 });

// Global feed default sort.
postSchema.index({ createdAt: -1 });

// Tag filter + interest-tag ranking.
postSchema.index({ tags: 1 });

// Discover search bar.
postSchema.index({ title: "text", content: "text" });

// Auto-delete sweep (jobs/autoDeletePosts.job.js queries expiresAt <= now).
postSchema.index({ expiresAt: 1 });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
