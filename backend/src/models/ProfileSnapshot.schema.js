const { Schema } = require("mongoose");

// Snapshot of a student's User profile fields at submission time — shared by
// CommunityApplication and Registration, each gated by their own
// collectProfileData flag. A snapshot, not a live reference, so it stays
// accurate even if the student edits their profile afterward.
const profileSnapshotSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    rollNo: { type: String, trim: true },
    prnNo: { type: String, trim: true },
    branch: { type: String, trim: true },
    yearOfJoining: { type: Number },
  },
  { _id: false }
);

module.exports = profileSnapshotSchema;
