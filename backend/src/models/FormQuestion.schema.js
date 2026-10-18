const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared by Event and CommunityRecruitment — same dynamic-question shape
// for both, so the two models import one definition instead of two copies
// that could drift apart.
//
// No separate `id` field — each subdocument gets a Mongoose _id, which is
// what Answer.schema.js's `question` field points back to.

const QUESTION_TYPES = ["text", "textarea", "number", "url", "image", "select", "radio", "checkbox"];
// Types that render as a pick-from-options widget.
const CHOICE_TYPES = ["select", "radio", "checkbox"];

const formQuestionSchema = new Schema({
  label: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: QUESTION_TYPES,
    required: true,
  },
  placeholder: { type: String, trim: true },
  helpText: { type: String, trim: true, maxlength: 300 },
  required: { type: Boolean, default: true },

  scope: {
    type: String,
    enum: ["team", "member"],
    default: "member",
  },

  // Required for select/radio/checkbox, ignored otherwise.
  options: {
    type: [{ type: String, trim: true }],
    validate: {
      validator: function (opts) {
        if (CHOICE_TYPES.includes(this.type)) return Array.isArray(opts) && opts.length >= 2;
        return true;
      },
      message: "A select/radio/checkbox question needs at least 2 options",
    },
  },
});

function isTeamQuestion(q) {
  if (!q) return false;
  if (q.scope === "team") return true;
  if (q.scope === "member") return false;
  const label = (q.label || "").toLowerCase();
  return /(team|project|idea|pitch|track|problem|abstract|theme|topic|synopsis|solution|startup|repo|repository|github|deck|presentation|slide|stack)/i.test(label);
}

module.exports = formQuestionSchema;
// Attached after the assignment above, same as Community.js's extra
// exports — Answer.schema.js imports these so its questionType enum and
// value-shape validator can't drift out of sync with this one.
module.exports.QUESTION_TYPES = QUESTION_TYPES;
module.exports.CHOICE_TYPES = CHOICE_TYPES;
module.exports.isTeamQuestion = isTeamQuestion;
