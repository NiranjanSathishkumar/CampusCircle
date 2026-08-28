// routes/authRoutes.js
const wrapAsync = require("../utils/wrapAsync");
const StudentAuth = require("../controllers/StudentAuthController");
const OrganizerAuth = require("../controllers/OrganizerAuthController");
const AdminAuth = require("../controllers/AdminAuthController");
const AdminController = require("../controllers/AdminController");
const { requireAuth, requireRole } = require("../middleware/AuthMiddleware");
const router = require("express").Router();

// Student — public signup
router.post("/api/signup", wrapAsync(StudentAuth.Signup));
router.post("/api/login", wrapAsync(StudentAuth.Login));
router.post("/api/refresh", wrapAsync(StudentAuth.RefreshToken));
router.post("/api/logout", wrapAsync(StudentAuth.Logout));

// Organizer — login only, account made by an admin
router.post("/api/organizer/login", wrapAsync(OrganizerAuth.Login));
router.post("/api/organizer/refresh", wrapAsync(OrganizerAuth.RefreshToken));
router.post("/api/organizer/logout", wrapAsync(OrganizerAuth.Logout));

// Admin — login only, account made manually in the DB
router.post("/api/admin/login", wrapAsync(AdminAuth.Login));
router.post("/api/admin/refresh", wrapAsync(AdminAuth.RefreshToken));
router.post("/api/admin/logout", wrapAsync(AdminAuth.Logout));

// Admin creates an organizer account
router.post(
  "/api/admin/organizers",
  requireAuth,
  requireRole("admin"),
  wrapAsync(AdminController.CreateOrganizer)
);

module.exports = router;