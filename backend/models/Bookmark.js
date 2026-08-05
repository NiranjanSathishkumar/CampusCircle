const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookmarkSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  },
  { timestamps: true }
);

// A student can't bookmark the same event twice — also makes "is this
// bookmarked by me" an O(1) indexed point lookup.
bookmarkSchema.index({ student: 1, event: 1 }, { unique: true });

// "My bookmarks" list, most recently bookmarked first.
bookmarkSchema.index({ student: 1, createdAt: -1 });

// Per-event / per-community-events bookmark counts — cheap countDocuments()
// on an indexed field, not a scan. Powers the engagement funnel.
bookmarkSchema.index({ event: 1 });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
module.exports = Bookmark;
