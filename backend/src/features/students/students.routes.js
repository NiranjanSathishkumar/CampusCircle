const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth, requireRole } = require("../../middleware/auth");
const { uploadImage, uploadDocument } = require("../../middleware/upload");
const syncToCloudinary = require("../../middleware/syncToCloudinary");
const validate = require("../../middleware/validate");
const schema = require("./students.validators");

const {
    uploadProfilePicture,
    uploadProfileBanner,
    getUserProfile,
    getStudentPublicProfile,
    lookupStudentProfile,
    updateUserProfile,
    removeProfilePicture,
    removeProfileBanner,
    getAchievements,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    uploadCertificate,
    removeCertificate,
    deleteUserProfile,
    listBuddies,
} = require("./students.controller");

router.use(requireAuth);

// requireRole applied per-route (not via router.use) so these static-path routes
// can be registered before the generic public /:studentId lookup below without
// that catch-all also falling under the student-only restriction.
const requireStudent = requireRole("student");

// Reserved single-segment sub-paths (/picture, /banner, /achievements, /buddies) would
// otherwise, on a method they don't define, fall through past their own
// router.route() and get swallowed by the /:studentId wildcard below - e.g.
// GET /picture would match :studentId = "picture" and fail Joi id validation
// with a confusing 400 instead of a 405. Pinning .all() as the last handler
// on each of those routes intercepts any method not already claimed by
// .get/.put/.post/.delete above it, before that fallthrough can happen.
const methodNotAllowed = (route) => {
    const allowedMethods = Object.keys(route.methods)
        .filter((method) => method !== "_all")
        .map((method) => method.toUpperCase());
    return (req, res) => {
        res.set("Allow", allowedMethods.join(", "));
        res.status(405).json({ message: "Method Not Allowed" });
    };
};

// Student-only profile and subdocument management. Each route here must stay
// registered before the /:studentId route at the bottom — Express matches path
// layers in registration order, and "picture"/"banner"/"achievements" would
// otherwise be swallowed by /:studentId as if they were a student id.
router.route("/")
    .get(requireStudent, wrapAsync(getUserProfile))
    .patch(requireStudent, validate(schema.updateProfile), wrapAsync(updateUserProfile))
    .delete(requireStudent, validate(schema.deleteAccount), wrapAsync(deleteUserProfile));

const pictureRoute = router.route("/picture")
    .put(requireStudent, uploadImage.single("profile_picture"), syncToCloudinary("profile-pictures"), wrapAsync(uploadProfilePicture))
    .delete(requireStudent, wrapAsync(removeProfilePicture));
pictureRoute.all(methodNotAllowed(pictureRoute));

const bannerRoute = router.route("/banner")
    .put(requireStudent, uploadImage.single("profile_banner"), syncToCloudinary("profile-banners"), wrapAsync(uploadProfileBanner))
    .delete(requireStudent, wrapAsync(removeProfileBanner));
bannerRoute.all(methodNotAllowed(bannerRoute));

const achievementsRoute = router.route("/achievements")
    .get(requireStudent, wrapAsync(getAchievements))
    .post(requireStudent, validate(schema.createAchievement), wrapAsync(createAchievement));
achievementsRoute.all(methodNotAllowed(achievementsRoute));

const achievementRoute = router.route("/achievements/:achievementId")
    .patch(requireStudent, validate(schema.achievementParams, "params"), validate(schema.updateAchievement), wrapAsync(updateAchievement))
    .delete(requireStudent, validate(schema.achievementParams, "params"), wrapAsync(deleteAchievement));
achievementRoute.all(methodNotAllowed(achievementRoute));

const certificateRoute = router.route("/achievements/:achievementId/certificate")
    // params validated before multer runs, so a malformed id costs no upload
    .put(requireStudent, validate(schema.achievementParams, "params"), uploadDocument.single("certificate"), syncToCloudinary("certificates", "auto"), wrapAsync(uploadCertificate))
    .delete(requireStudent, validate(schema.achievementParams, "params"), wrapAsync(removeCertificate));
certificateRoute.all(methodNotAllowed(certificateRoute));

const lookupRoute = router.route("/lookup")
    .get(validate(schema.lookupStudent, "query"), wrapAsync(lookupStudentProfile));
lookupRoute.all(methodNotAllowed(lookupRoute));

const buddiesRoute = router.route("/buddies")
    .get(validate(schema.listBuddies, "query"), wrapAsync(listBuddies));
buddiesRoute.all(methodNotAllowed(buddiesRoute));

// Public student profile view (accessible by any authenticated user — students,
// organizers, admins). Registered last so it only catches what the routes above
// didn't already claim; mounted at /api/profile, so this is just /:studentId
// rather than the redundant /profile/students/:studentId.
router.route("/:studentId")
    .get(validate(schema.studentParams, "params"), wrapAsync(getStudentPublicProfile));

module.exports = router;

