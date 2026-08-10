const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const wrapAsync = require("../utils/wrapAsync");
const { requireAuth, requireRole } = require("../middleware/AuthMiddleware");
const syncToCloudinary = require("../middleware/syncToCloudinary");

const {
    uploadLogo,
    uploadBanner,
    removeLogo,
    removeBanner,
    getCommunityInfo,
    updateCommunityInfo,
    addCoreTeamMember,
    updateCoreTeamMemberRole,
    removeCoreTeamMember,
    addTag,
    removeTag,
    setSocialLink,
    removeSocialLink,
    addFaq,
    updateFaq,
    removeFaq
} = require("../controllers/OrganizerController");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
    }
});

router.use(requireAuth);
router.use(requireRole("organizer"));
router.use((req, res, next) => {
    req.community = req.user;
    next();
});

// Community Info / Profile
router.route("/get_info")
    .get(wrapAsync(getCommunityInfo));

router.route("/get_profile")
    .get(wrapAsync(getCommunityInfo));

router.route("/update_info")
    .patch(wrapAsync(updateCommunityInfo));

router.route("/update_profile")
    .patch(wrapAsync(updateCommunityInfo));

// Logo & Banner
router.route("/update_logo")
    .put(upload.single("logo"), syncToCloudinary("community-logos"), wrapAsync(uploadLogo));

router.route("/remove_logo")
    .delete(wrapAsync(removeLogo));

router.route("/update_banner")
    .put(upload.single("banner"), syncToCloudinary("community-banners"), wrapAsync(uploadBanner));

router.route("/remove_banner")
    .delete(wrapAsync(removeBanner));

// Core Team
router.route("/core_team")
    .post(wrapAsync(addCoreTeamMember));

router.route("/core-team")
    .post(wrapAsync(addCoreTeamMember));

router.route("/core_team/:studentId")
    .patch(wrapAsync(updateCoreTeamMemberRole))
    .delete(wrapAsync(removeCoreTeamMember));

router.route("/core-team/:studentId")
    .patch(wrapAsync(updateCoreTeamMemberRole))
    .delete(wrapAsync(removeCoreTeamMember));

// Tags
router.route("/tags")
    .post(wrapAsync(addTag));

router.route("/tags/:tag")
    .delete(wrapAsync(removeTag));

// Social Links
router.route("/social_links")
    .post(wrapAsync(setSocialLink))
    .put(wrapAsync(setSocialLink));

router.route("/social-links")
    .post(wrapAsync(setSocialLink))
    .put(wrapAsync(setSocialLink));

router.route("/social_links/:platform")
    .delete(wrapAsync(removeSocialLink));

router.route("/social-links/:platform")
    .delete(wrapAsync(removeSocialLink));

// FAQs
router.route("/faqs")
    .post(wrapAsync(addFaq));

router.route("/faqs/:faqId")
    .patch(wrapAsync(updateFaq))
    .put(wrapAsync(updateFaq))
    .delete(wrapAsync(removeFaq));

module.exports = router;
