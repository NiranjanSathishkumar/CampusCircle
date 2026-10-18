// Recruitment routes: drives, applications, membership roster.
// Mount at /api/recruitment. Organizers manage drives and review applicants;
// students apply and read their own application history.
const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth, requireRole } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const schema = require("./recruitment.validators");

const { createDrive, updateDrive, deleteDrive, getDrive, listCommunityDrives } = require("./recruitment.controller");

const {
    submitApplication,
    listMyApplications,
    listDriveApplications,
    updateApplicationStatus,
} = require("./applications.controller");

const {
    listRoster,
    addMember,
    updateMemberLabel,
    removeMember,
    bulkRemoveMembers,
    listMyMemberships,
} = require("./memberships.controller");

router.use(requireAuth);

// Drives
router.route("/drives")
    .post(requireRole("organizer"), validate(schema.createDrive), wrapAsync(createDrive));

router.route("/drives/:recruitmentId")
    .get(validate(schema.recruitmentParams, "params"), wrapAsync(getDrive))
    .patch(requireRole("organizer"), validate(schema.recruitmentParams, "params"), validate(schema.updateDrive), wrapAsync(updateDrive))
    .delete(requireRole("organizer"), validate(schema.recruitmentParams, "params"), wrapAsync(deleteDrive));

router.route("/communities/:communityId/drives")
    .get(validate(schema.communityParams, "params"), validate(schema.drivesQuery, "query"), wrapAsync(listCommunityDrives));

// Applications
router.route("/drives/:recruitmentId/applications")
    .post(requireRole("student"), validate(schema.recruitmentParams, "params"), validate(schema.submitApplication), wrapAsync(submitApplication))
    .get(requireRole("organizer"), validate(schema.recruitmentParams, "params"), validate(schema.applicationsQuery, "query"), wrapAsync(listDriveApplications));

router.route("/applications/mine")
    .get(requireRole("student"), validate(schema.paginationQuery, "query"), wrapAsync(listMyApplications));

router.route("/applications/:applicationId")
    .patch(requireRole("organizer"), validate(schema.applicationParams, "params"), validate(schema.updateApplicationStatus), wrapAsync(updateApplicationStatus));

// Membership roster — organizer manages their own community's roster via req.user
router.route("/members/mine")
    .get(requireRole("student"), validate(schema.paginationQuery, "query"), wrapAsync(listMyMemberships));

// bulk-remove MUST come before /members/:membershipId so it isn't swallowed as a param
router.route("/members/bulk-remove")
    .post(requireRole("organizer"), validate(schema.bulkRemoveMembers), wrapAsync(bulkRemoveMembers));

router.route("/members")
    .get(requireRole("organizer"), validate(schema.paginationQuery, "query"), wrapAsync(listRoster))
    .post(requireRole("organizer"), validate(schema.addMember), wrapAsync(addMember));

router.route("/members/:membershipId")
    .patch(requireRole("organizer"), validate(schema.membershipParams, "params"), validate(schema.updateMemberLabel), wrapAsync(updateMemberLabel))
    .delete(requireRole("organizer"), validate(schema.membershipParams, "params"), wrapAsync(removeMember));

module.exports = router;
