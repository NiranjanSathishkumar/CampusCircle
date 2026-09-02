// Follow / unfollow routes. Mount at /api/follows.
// Writes and viewing own following feed are student-only; follower list is readable per target.
const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth, requireRole } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const schema = require("./follows.validators");

const {
    followTarget,
    unfollowTarget,
    listFollowing,
    listFollowers,
} = require("./follows.controller");

router.use(requireAuth);

router.route("/")
    .post(requireRole("student"), validate(schema.followTarget), wrapAsync(followTarget));

router.route("/following")
    .get(requireRole("student"), validate(schema.listQuery, "query"), wrapAsync(listFollowing));

router.route("/followers/:followingType/:followingId")
    .get(validate(schema.targetParams, "params"), validate(schema.listQuery, "query"), wrapAsync(listFollowers));

router.route("/:followingType/:followingId")
    .delete(requireRole("student"), validate(schema.targetParams, "params"), wrapAsync(unfollowTarget));

module.exports = router;
