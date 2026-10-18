const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth, requireRole } = require("../../middleware/auth");
const { uploadImage } = require("../../middleware/upload");
const syncToCloudinary = require("../../middleware/syncToCloudinary");
const validate = require("../../middleware/validate");
const schemas = require("./communities.validators");

const {
    uploadLogo,
    uploadBanner,
    removeLogo,
    removeBanner,
    getCommunityInfo,
    updateCommunityInfo,
    getAuditLogs,
} = require("./communities.controller");

const { getOverviewAnalytics } = require("./analytics.controller");
const { getDashboardOverview } = require("./dashboard.controller");

const {
    addCoreTeamMember,
    updateCoreTeamMemberRole,
    removeCoreTeamMember,
    bulkRemoveCoreTeamMembers,
    addTag,
    removeTag,
    setSocialLink,
    removeSocialLink,
    addFaq,
    updateFaq,
    removeFaq,
} = require("./coreTeam.controller");

router.use(requireAuth);
router.use(requireRole("organizer"));
router.use((req, res, next) => {
    req.community = req.user;
    next();
});

// Analytics / Dashboard — registered before the plain "/" route so their
// extra path segments can't be swallowed as a param anywhere they shouldn't.
router.route("/analytics/overview")
    .get(wrapAsync(getOverviewAnalytics));

router.route("/dashboard")
    .get(validate(schemas.dashboardQuery, "query"), wrapAsync(getDashboardOverview));

// Community Info / Profile
router.route("/")
    .get(wrapAsync(getCommunityInfo))
    .patch(validate(schemas.updateInfo), wrapAsync(updateCommunityInfo));

// Audit Log — own community's shared-login history only
router.route("/audit-logs")
    .get(validate(schemas.auditLogsQuery, "query"), wrapAsync(getAuditLogs));

// Logo & Banner
router.route("/logo")
    .put(uploadImage.single("logo"), syncToCloudinary("community-logos"), wrapAsync(uploadLogo))
    .delete(wrapAsync(removeLogo));

router.route("/banner")
    .put(uploadImage.single("banner"), syncToCloudinary("community-banners"), wrapAsync(uploadBanner))
    .delete(wrapAsync(removeBanner));

// Core Team — bulk-remove MUST come before :studentId so it's not swallowed as a param
router.route("/core-team/bulk-remove")
    .post(validate(schemas.bulkRemoveCoreTeamMembers), wrapAsync(bulkRemoveCoreTeamMembers));

router.route("/core-team")
    .post(validate(schemas.addCoreTeamMember), wrapAsync(addCoreTeamMember));

router.route("/core-team/:studentId")
    .patch(validate(schemas.coreTeamParams, "params"), validate(schemas.updateCoreTeamMemberRole), wrapAsync(updateCoreTeamMemberRole))
    .delete(validate(schemas.coreTeamParams, "params"), wrapAsync(removeCoreTeamMember));

// Tags
router.route("/tags")
    .post(validate(schemas.addTag), wrapAsync(addTag));

router.route("/tags/:tag")
    .delete(validate(schemas.tagParams, "params"), wrapAsync(removeTag));

// Social Links
router.route("/social-links")
    .post(validate(schemas.setSocialLink), wrapAsync(setSocialLink))
    .put(validate(schemas.setSocialLink), wrapAsync(setSocialLink));

router.route("/social-links/:platform")
    .delete(validate(schemas.socialLinkParams, "params"), wrapAsync(removeSocialLink));

// FAQs
router.route("/faqs")
    .post(validate(schemas.addFaq), wrapAsync(addFaq));

router.route("/faqs/:faqId")
    .patch(validate(schemas.faqParams, "params"), validate(schemas.updateFaq), wrapAsync(updateFaq))
    .put(validate(schemas.faqParams, "params"), validate(schemas.updateFaq), wrapAsync(updateFaq))
    .delete(validate(schemas.faqParams, "params"), wrapAsync(removeFaq));

module.exports = router;
