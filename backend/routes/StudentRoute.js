const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const wrapAsync = require("../utils/wrapAsync");
const { requireAuth } = require("../middleware/AuthMiddleware");
const syncToCloudinary = require("../middleware/syncToCloudinary");

const {
    uploadProfilePicture,
    uploadProfileBanner,
    getUserProfile,
    updateUserProfile,
    removeProfilePicture,
    removeProfileBanner
} = require("../controllers/StudentController")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
    }
});

router.use(requireAuth);

router.route("/get_profile")
    .get(wrapAsync(getUserProfile));

router.route("/update_profile")
    .patch(wrapAsync(updateUserProfile));

router.route("/update_profile_picture")
    .put(upload.single("profile_picture"), syncToCloudinary("profile-pictures"), wrapAsync(uploadProfilePicture));

router.route("/update_profile_banner")
    .put(upload.single("profile_banner"), syncToCloudinary("profile-banners"), wrapAsync(uploadProfileBanner));

router.route("/remove_profile_picture")
    .delete(wrapAsync(removeProfilePicture));

router.route("/remove_profile_banner")
    .delete(wrapAsync(removeProfileBanner));

module.exports = router;

