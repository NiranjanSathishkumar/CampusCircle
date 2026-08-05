const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/AuthMiddleware");
const wrapAsync = require("../utils/wrapAsync");
const {
    updateProfile,
    getProfile,
    getCurrentProfile,
    getAllStudents,
    deleteProfile,
} = require("../controllers/StudentController");

// GET /api/profile/me - Fetch currently logged in student profile
router.get("/me", isLoggedIn, wrapAsync(getCurrentProfile));

// GET /api/profile - Fetch all student profiles
router.get("/", wrapAsync(getAllStudents));

// GET /api/profile/:id - Fetch student profile by ID
router.get("/:id", wrapAsync(getProfile));

// PUT /api/profile/:id - Update student profile by ID
router.put("/:id", isLoggedIn, wrapAsync(updateProfile));

// POST /api/profile - Update student profile
router.post("/", isLoggedIn, wrapAsync(updateProfile));

// DELETE /api/profile - Delete student account
router.delete("/", isLoggedIn, wrapAsync(deleteProfile));

// DELETE /api/profile/:id - Delete student account by ID
router.delete("/:id", isLoggedIn, wrapAsync(deleteProfile));

module.exports = router;

