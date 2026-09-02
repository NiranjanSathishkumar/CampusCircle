// Public community discovery. Mounted at /api/communities (plural) -
// distinct from /api/community (singular), which is the organizer-only
// self-management router in communities.routes.js. Any authenticated role
// can browse here; there is no requireRole gate.
const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const schema = require("./discovery.validators");

const { listCommunities, getCommunityById } = require("./discovery.controller");

router.use(requireAuth);

router.route("/")
    .get(validate(schema.listCommunities, "query"), wrapAsync(listCommunities));

router.route("/:communityId")
    .get(validate(schema.communityIdParams, "params"), wrapAsync(getCommunityById));

module.exports = router;
