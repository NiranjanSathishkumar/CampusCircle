const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared by Registration (event form answers) and CommunityApplication
// (recruitment form answers) — same {question, value} shape for both,
// since both mirror the same dynamic-question pattern defined in
// formQuestion.schema.js. `question` correlates back to the _id of a
// subdocument in Event.formQuestions or CommunityRecruitment.formQuestions.
const answerSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, required: true },
    // Snapshot of the question's label text at submission time — ensures old answers
    // remain interpretable even if an Organizer edits or deletes a question definition later.
    questionLabel: { type: String, required: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true }, // shape depends on the question's type
  },
  { _id: false }
);

module.exports = answerSchema;
