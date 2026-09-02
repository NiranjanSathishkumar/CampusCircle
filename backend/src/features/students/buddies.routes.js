// Public buddies / peer discovery route.
// Mounted at /api/buddies (mirroring /api/communities for clubs).
// Any authenticated role (student, organizer, admin) can browse here.
const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const schema = require("./students.validators");

const { listBuddies, getStudentPublicProfile } = require("./students.controller");

router.use(requireAuth);

router.route("/")
    .get(validate(schema.listBuddies, "query"), wrapAsync(listBuddies));

router.route("/:studentId")
    .get(validate(schema.studentParams, "params"), wrapAsync(getStudentPublicProfile));

module.exports = router;
