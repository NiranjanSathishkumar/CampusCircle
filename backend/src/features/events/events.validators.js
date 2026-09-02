// Joi schemas for events: create/update payload (dates, capacity 1-1000,
// registrationType solo|team with conditional teamSize), registration answers,
// and the :eventId / :registrationId params.
const Joi = require("joi");
const { QUESTION_TYPES } = require("../../models/FormQuestion.schema");
const { EVENT_CATEGORIES, EVENT_STATUSES } = require("../../models/Event");
const { objectId, email } = require("../../validators/common");

const formQuestion = Joi.object({
    label: Joi.string().trim().max(200).required(),
    type: Joi.string().valid(...QUESTION_TYPES).required(),
    placeholder: Joi.string().trim().max(200).allow(""),
    helpText: Joi.string().trim().max(300).allow(""),
    required: Joi.boolean(),
    options: Joi.array().items(Joi.string().trim().max(100)),
});

const teamSize = Joi.object({
    min: Joi.number().integer().min(1).required(),
    max: Joi.number().integer().min(1).required(),
});

const contactCard = Joi.object({
    leadName: Joi.string().trim().max(150).allow(""),
    leadRole: Joi.string().trim().max(150).allow(""),
    email: email.allow(""),
    phone: Joi.string().trim().max(20).allow(""),
    deskLocation: Joi.string().trim().max(200).allow(""),
    building: Joi.string().trim().max(100).allow(""),
    room: Joi.string().trim().max(100).allow(""),
    floor: Joi.string().trim().max(100).allow(""),
    emailSLA: Joi.string().trim().max(150).allow(""),
    operatingHours: Joi.string().trim().max(150).allow(""),
});

const agendaItem = Joi.object({
    phase: Joi.string().trim().max(150).required(),
    title: Joi.string().trim().max(200).required(),
    desc: Joi.string().trim().max(1000).allow(""),
});

const faqItem = Joi.object({
    q: Joi.string().trim().max(300).required(),
    a: Joi.string().trim().max(1000).required(),
});

// Auto-delete timeline: community-only, 1-12 months after the event
// completes, defaults to 1.
const autoDeleteAfterMonths = Joi.number().integer().min(1).max(12);

// ── Events ────────────────────────────────────────────────────────
const createEvent = Joi.object({
    title: Joi.string().trim().max(200).required(),
    category: Joi.string().valid(...EVENT_CATEGORIES).required(),
    description: Joi.string().trim().max(5000).required(),
    venue: Joi.string().trim().max(300).required(),
    eventDate: Joi.date().required(),
    eventEndDate: Joi.date(),
    registrationDeadline: Joi.date(),
    contact: contactCard,
    agenda: Joi.array().items(agendaItem).max(30),
    rules: Joi.array().items(Joi.string().trim().max(300)).max(50),
    faqs: Joi.array().items(faqItem).max(30),
    tags: Joi.array().items(Joi.string().trim().lowercase().max(30)).max(20),
    registrationType: Joi.string().valid("solo", "team").required(),
    // Required only when registrationType is "team" — the model's own
    // pre-validate hook is the final word, this just gives a faster 400.
    teamSize: Joi.when("registrationType", {
        is: "team",
        then: teamSize.required(),
        otherwise: Joi.forbidden(),
    }),
    capacity: Joi.number().integer().min(1).max(1000).required(),
    price: Joi.number().min(0),
    collectProfileData: Joi.boolean(),
    allowWaitlist: Joi.boolean(),
    requireWaiver: Joi.boolean(),
    waiverText: Joi.string().trim().max(2000).allow(""),
    confirmationMessage: Joi.string().trim().max(500).allow(""),
    sendEmailReceipt: Joi.boolean(),
    formQuestions: Joi.array().items(formQuestion).max(30),
    autoDeleteAfterMonths: autoDeleteAfterMonths.default(1),
    status: Joi.string().valid(...EVENT_STATUSES),
});

// PATCH: any subset. teamSize isn't cross-checked against registrationType
// here (a partial payload may change neither, either, or both) — the
// model's pre-validate hook enforces the real constraint on save.
const updateEvent = Joi.object({
    title: Joi.string().trim().max(200),
    category: Joi.string().valid(...EVENT_CATEGORIES),
    description: Joi.string().trim().max(5000),
    venue: Joi.string().trim().max(300),
    eventDate: Joi.date(),
    eventEndDate: Joi.date().allow(null),
    registrationDeadline: Joi.date().allow(null),
    contact: contactCard.allow(null),
    agenda: Joi.array().items(agendaItem).max(30),
    rules: Joi.array().items(Joi.string().trim().max(300)).max(50),
    faqs: Joi.array().items(faqItem).max(30),
    tags: Joi.array().items(Joi.string().trim().lowercase().max(30)).max(20),
    registrationType: Joi.string().valid("solo", "team"),
    teamSize: teamSize.allow(null),
    capacity: Joi.number().integer().min(1).max(1000),
    price: Joi.number().min(0),
    collectProfileData: Joi.boolean(),
    allowWaitlist: Joi.boolean(),
    requireWaiver: Joi.boolean(),
    waiverText: Joi.string().trim().max(2000).allow(""),
    confirmationMessage: Joi.string().trim().max(500).allow(""),
    sendEmailReceipt: Joi.boolean(),
    formQuestions: Joi.array().items(formQuestion).max(30),
    isActive: Joi.boolean(),
    status: Joi.string().valid(...EVENT_STATUSES),
    autoDeleteAfterMonths,
}).min(1);

const eventParams = Joi.object({ eventId: objectId.required() });
const communityParams = Joi.object({ communityId: objectId.required() });

const paginationQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

const eventsQuery = paginationQuery.keys({
    tag: Joi.string().trim().lowercase().max(30),
    search: Joi.string().trim().max(200),
});

// ── Registrations ─────────────────────────────────────────────────
const answerInput = Joi.object({ question: objectId.required(), value: Joi.any().required() });

const teamMemberInput = Joi.object({
    studentId: objectId.required(),
    answers: Joi.array().items(answerInput).max(50),
});

const register = Joi.object({
    teamName: Joi.string().trim().max(200),
    answers: Joi.array().items(answerInput).max(50),
    teamMembers: Joi.array().items(teamMemberInput).max(50),
});

const cancelRegistration = Joi.object({ reason: Joi.string().trim().max(300).allow("") });

const registrationParams = Joi.object({ registrationId: objectId.required() });

const registrationsQuery = paginationQuery.keys({
    status: Joi.string().valid("confirmed", "waitlisted", "cancelled"),
});

// ── Team members ──────────────────────────────────────────────────
const addTeamMember = Joi.object({
    studentId: objectId.required(),
    answers: Joi.array().items(answerInput).max(50),
});

const teamMemberParams = Joi.object({
    registrationId: objectId.required(),
    teamMemberId: objectId.required(),
});

const respondToInvite = Joi.object({
    action: Joi.string().valid("accept", "decline").required(),
});

// ── Check-in ──────────────────────────────────────────────────────
const checkIn = Joi.object({
    qrToken: Joi.string().trim().hex().length(32).required(),
});

module.exports = {
    createEvent, updateEvent, eventParams, communityParams, paginationQuery, eventsQuery,
    register, cancelRegistration, registrationParams, registrationsQuery,
    addTeamMember, teamMemberParams, respondToInvite,
    checkIn,
};
