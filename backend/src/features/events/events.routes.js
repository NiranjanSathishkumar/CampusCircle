// Event routes. Mount at /api/events.
// Organizer: event CRUD, registrant lists, check-in. Student: browse, register,
// bookmark. Both roles share this prefix, so requireRole goes per-route rather
// than on the router.
const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth, requireRole } = require("../../middleware/auth");
const { uploadImage } = require("../../middleware/upload");
const syncToCloudinary = require("../../middleware/syncToCloudinary");
const validate = require("../../middleware/validate");
const schema = require("./events.validators");

const {
    createEvent,
    updateEvent,
    deleteEvent,
    uploadBanner,
    removeBanner,
    uploadPaymentQr,
    removePaymentQr,
    getEvent,
    listEvents,
    listCommunityEvents,
    likeEvent,
    unlikeEvent,
    trackEventView,
    trackRegistrationStarted,
} = require("./events.controller");

const {
    registerForEvent,
    listMyRegistrations,
    listEventRegistrations,
    getRegistration,
    cancelRegistration,
    uploadPaymentProof,
    listEventPaymentVerifications,
    verifyPayment,
} = require("./registrations.controller");

const {
    listTeamMembers,
    addTeamMember,
    removeTeamMember,
    respondToTeamInvite,
    listMyTeamInvites,
} = require("./teams.controller");
const { checkIn } = require("./checkin.controller");
const { bookmarkEvent, unbookmarkEvent, listMyBookmarks } = require("./bookmarks.controller");

router.use(requireAuth);

// Events
router.route("/")
    .get(validate(schema.eventsQuery, "query"), wrapAsync(listEvents))
    .post(requireRole("organizer"), validate(schema.createEvent), wrapAsync(createEvent));

router.route("/communities/:communityId/events")
    .get(validate(schema.communityParams, "params"), validate(schema.paginationQuery, "query"), wrapAsync(listCommunityEvents));

// "mine" routes must be registered before their sibling /:id routes below,
// or ":registrationId"/":eventId" would greedily swallow the literal "mine".
router.route("/registrations/mine")
    .get(requireRole("student"), validate(schema.registrationsQuery, "query"), wrapAsync(listMyRegistrations));

router.route("/bookmarks/mine")
    .get(requireRole("student"), validate(schema.paginationQuery, "query"), wrapAsync(listMyBookmarks));

router.route("/team-invites/mine")
    .get(requireRole("student"), wrapAsync(listMyTeamInvites));

router.route("/registrations/:registrationId")
    .get(requireRole("student", "organizer"), validate(schema.registrationParams, "params"), wrapAsync(getRegistration))
    .delete(requireRole("student", "organizer"), validate(schema.registrationParams, "params"), validate(schema.cancelRegistration), wrapAsync(cancelRegistration));

router.route("/registrations/:registrationId/team-members")
    .get(requireRole("student", "organizer"), validate(schema.registrationParams, "params"), wrapAsync(listTeamMembers))
    .post(requireRole("student"), validate(schema.registrationParams, "params"), validate(schema.addTeamMember), wrapAsync(addTeamMember));

router.route("/registrations/:registrationId/team-members/:teamMemberId")
    .delete(requireRole("student"), validate(schema.teamMemberParams, "params"), wrapAsync(removeTeamMember));

router.route("/registrations/:registrationId/team-members/:teamMemberId/respond")
    .patch(requireRole("student"), validate(schema.teamMemberParams, "params"), validate(schema.respondToInvite), wrapAsync(respondToTeamInvite));

router.route("/registrations/:registrationId/payment-proof")
    .post(requireRole("student"), validate(schema.registrationParams, "params"), uploadImage.single("paymentProof"), syncToCloudinary("payment-proofs"), wrapAsync(uploadPaymentProof));

router.route("/registrations/:registrationId/verify-payment")
    .patch(requireRole("organizer"), validate(schema.registrationParams, "params"), validate(schema.verifyPayment), wrapAsync(verifyPayment));

router.route("/:eventId")
    .get(validate(schema.eventParams, "params"), wrapAsync(getEvent))
    .patch(requireRole("organizer"), validate(schema.eventParams, "params"), validate(schema.updateEvent), wrapAsync(updateEvent))
    .delete(requireRole("organizer"), validate(schema.eventParams, "params"), wrapAsync(deleteEvent));

router.route("/:eventId/banner")
    .put(requireRole("organizer"), validate(schema.eventParams, "params"), uploadImage.single("banner"), syncToCloudinary("event-banners"), wrapAsync(uploadBanner))
    .delete(requireRole("organizer"), validate(schema.eventParams, "params"), wrapAsync(removeBanner));

router.route("/:eventId/payment-qr")
    .put(requireRole("organizer"), validate(schema.eventParams, "params"), uploadImage.single("paymentQr"), syncToCloudinary("event-payment-qrs"), wrapAsync(uploadPaymentQr))
    .delete(requireRole("organizer"), validate(schema.eventParams, "params"), wrapAsync(removePaymentQr));

router.route("/:eventId/payment-verifications")
    .get(requireRole("organizer"), validate(schema.eventParams, "params"), wrapAsync(listEventPaymentVerifications));

router.route("/:eventId/like")
    .post(requireRole("student"), validate(schema.eventParams, "params"), wrapAsync(likeEvent))
    .delete(requireRole("student"), validate(schema.eventParams, "params"), wrapAsync(unlikeEvent));

router.route("/:eventId/view")
    .post(requireRole("student"), validate(schema.eventParams, "params"), wrapAsync(trackEventView));

router.route("/:eventId/registration-started")
    .post(requireRole("student"), validate(schema.eventParams, "params"), wrapAsync(trackRegistrationStarted));

router.route("/:eventId/bookmark")
    .post(requireRole("student"), validate(schema.eventParams, "params"), wrapAsync(bookmarkEvent))
    .delete(requireRole("student"), validate(schema.eventParams, "params"), wrapAsync(unbookmarkEvent));

router.route("/:eventId/register")
    .post(requireRole("student"), validate(schema.eventParams, "params"), validate(schema.register), wrapAsync(registerForEvent));

router.route("/:eventId/registrations")
    .get(requireRole("organizer"), validate(schema.eventParams, "params"), validate(schema.registrationsQuery, "query"), wrapAsync(listEventRegistrations));

router.route("/:eventId/check-in")
    .post(requireRole("organizer"), validate(schema.eventParams, "params"), validate(schema.checkIn), wrapAsync(checkIn));

module.exports = router;
