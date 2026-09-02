// Joi schemas for drives (title, description, formQuestions, deadline),
// application answers, status transitions, and membership labels.
const Joi = require("joi");
const { QUESTION_TYPES } = require("../../models/FormQuestion.schema");
const { objectId } = require("../../validators/common");

// Shape-only. The >=2-options-for-choice-types business rule already lives on
// FormQuestion.schema.js's own validator, so a bad payload surfaces as a
// Mongoose ValidationError on save rather than being re-checked here.
const formQuestion = Joi.object({
    label: Joi.string().trim().max(200).required(),
    type: Joi.string().valid(...QUESTION_TYPES).required(),
    placeholder: Joi.string().trim().max(200).allow(""),
    helpText: Joi.string().trim().max(300).allow(""),
    required: Joi.boolean(),
    options: Joi.array().items(Joi.string().trim().max(100)),
});

// Auto-delete timeline: community-only, 1-12 months, defaults to 6.
const autoDeleteAfterMonths = Joi.number().integer().min(1).max(12);

// ── Drives ────────────────────────────────────────────────────────
const createDrive = Joi.object({
    title: Joi.string().trim().max(200).required(),
    description: Joi.string().trim().max(3000).required(),
    formQuestions: Joi.array().items(formQuestion).max(30),
    deadline: Joi.date().greater("now"),
    collectProfileData: Joi.boolean(),
    requireWaiver: Joi.boolean(),
    waiverText: Joi.string().trim().max(2000).allow(""),
    confirmationMessage: Joi.string().trim().max(500).allow(""),
    sendEmailReceipt: Joi.boolean(),
    autoDeleteAfterMonths: autoDeleteAfterMonths.default(6),
});

// PATCH also handles "close" (isOpen: false) / reopen (isOpen: true) and
// restoring a soft-deleted drive (isActive: true) — the stub's "create /
// update / close a drive" isn't three separate routes.
const updateDrive = Joi.object({
    title: Joi.string().trim().max(200),
    description: Joi.string().trim().max(3000),
    formQuestions: Joi.array().items(formQuestion).max(30),
    deadline: Joi.date().allow(null),
    collectProfileData: Joi.boolean(),
    requireWaiver: Joi.boolean(),
    waiverText: Joi.string().trim().max(2000).allow(""),
    confirmationMessage: Joi.string().trim().max(500).allow(""),
    sendEmailReceipt: Joi.boolean(),
    isOpen: Joi.boolean(),
    isActive: Joi.boolean(),
    autoDeleteAfterMonths,
}).min(1);

const recruitmentParams = Joi.object({ recruitmentId: objectId.required() });
const communityParams = Joi.object({ communityId: objectId.required() });

const paginationQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

const drivesQuery = paginationQuery.keys({
    isOpen: Joi.boolean(),
});

// ── Applications ──────────────────────────────────────────────────
// Per-question required/option-membership checks happen in the controller
// against the drive's actual formQuestions — Joi only knows the envelope shape.
const submitApplication = Joi.object({
    answers: Joi.array()
        .items(Joi.object({ question: objectId.required(), value: Joi.any().required() }))
        .max(50),
});

const applicationParams = Joi.object({ applicationId: objectId.required() });

const applicationsQuery = paginationQuery.keys({
    status: Joi.string().valid("pending", "selected", "rejected").empty(""),
});

const updateApplicationStatus = Joi.object({
    status: Joi.string().valid("pending", "selected", "rejected").required(),
});

// ── Membership roster ─────────────────────────────────────────────
const addMember = Joi.object({
    studentId: objectId.required(),
    label: Joi.string().trim().max(128),
});
const updateMemberLabel = Joi.object({ label: Joi.string().trim().max(128).required() });
const membershipParams = Joi.object({ membershipId: objectId.required() });

module.exports = {
    createDrive, updateDrive, recruitmentParams, communityParams, drivesQuery, paginationQuery,
    submitApplication, applicationParams, applicationsQuery, updateApplicationStatus,
    addMember, updateMemberLabel, membershipParams,
};
