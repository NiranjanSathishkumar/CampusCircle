const ExpressError = require("./ExpressError");
const { CHOICE_TYPES } = require("../models/FormQuestion.schema");

// Matches submitted {question, value} pairs against a set of formQuestions
// (Event.formQuestions or CommunityRecruitment.formQuestions), snapshotting
// label/type per Answer.schema.js and enforcing the required/option
// constraints the schema alone can't (it has no formQuestions to check
// against). Shared by recruitment applications and event registrations —
// both answer dynamic questions the exact same way.
function buildAnswers(formQuestions, submitted = []) {
    const valueByQuestion = new Map(submitted.map((a) => [String(a.question), a.value]));

    return formQuestions.reduce((answers, question) => {
        const value = valueByQuestion.get(String(question._id));
        const isEmpty = value === undefined || value === null || value === "" ||
            (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
            if (question.required) throw new ExpressError(400, `"${question.label}" is required`);
            return answers;
        }

        if (CHOICE_TYPES.includes(question.type)) {
            const values = question.type === "checkbox" ? (Array.isArray(value) ? value : [value]) : [value];
            const invalid = values.filter((v) => !question.options.includes(v));
            if (invalid.length) {
                throw new ExpressError(400, `Invalid option for "${question.label}": ${invalid.join(", ")}`);
            }

            if (question.type === "checkbox") {
                answers.push({ question: question._id, questionLabel: question.label, questionType: question.type, value: values });
                return answers;
            }
        }

        answers.push({ question: question._id, questionLabel: question.label, questionType: question.type, value });
        return answers;
    }, []);
}

module.exports = buildAnswers;
