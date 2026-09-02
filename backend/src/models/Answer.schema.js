const mongoose = require("mongoose");
const { Schema } = mongoose;
const { QUESTION_TYPES, CHOICE_TYPES } = require("./FormQuestion.schema");

// Shared by Registration, CommunityApplication, and TeamMember — same
// {question, value} shape for all three, since they all answer the same
// dynamic-question pattern defined in FormQuestion.schema.js. `question`
// correlates back to the _id of a subdocument in Event.formQuestions or
// CommunityRecruitment.formQuestions.
const answerSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, required: true },

    // Snapshots of the question's label/type at submission time — both keep
    // an old answer interpretable (label for display, type for knowing what
    // shape `value` is) even after an Organizer edits or deletes the
    // question definition later.
    questionLabel: { type: String, required: true, trim: true },
    questionType: { type: String, enum: QUESTION_TYPES, required: true },

    // Shape must match questionType: array of strings for checkbox, a
    // number for "number", a string otherwise. Kept as Mixed since the
    // actual shape varies per question — see the validator below.
    value: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (v) {
          if (this.questionType === "checkbox") return Array.isArray(v) && v.length > 0;
          if (this.questionType === "number") return typeof v === "number" && !Number.isNaN(v);
          if (CHOICE_TYPES.includes(this.questionType)) return typeof v === "string" && v.length > 0;
          return typeof v === "string";
        },
        message: "Answer value does not match the expected shape for this question's type",
      },
    },
  },
  { _id: false }
);

module.exports = answerSchema;
