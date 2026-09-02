const wrapAsync = require("../../utils/wrapAsync");
const validate = require("../../middleware/validate");
const { createLoginLimiter, createRefreshLimiter, createSignupLimiter, createCheckEmailLimiter } = require("../../middleware/rateLimit");
const auth = require("./auth.controller");
const schema = require("./auth.validators");
const router = require("express").Router();

// Mounted at /api — paths below are relative to that prefix.

// Student — public signup
router.get("/check-email", createCheckEmailLimiter(), validate(schema.checkEmail, "query"), wrapAsync(auth.checkEmailAvailability));
router.post("/signup", createSignupLimiter(), validate(schema.signup), wrapAsync(auth.student.signup));
router.post("/login", createLoginLimiter(), validate(schema.login), wrapAsync(auth.student.login));
router.post("/refresh", createRefreshLimiter(), wrapAsync(auth.student.refreshToken));
router.post("/logout", wrapAsync(auth.student.logout));

// Organizer — login only, account made by an admin
router.post("/organizer/login", createLoginLimiter(), validate(schema.login), wrapAsync(auth.organizer.login));
router.post("/organizer/refresh", createRefreshLimiter(), wrapAsync(auth.organizer.refreshToken));
router.post("/organizer/logout", wrapAsync(auth.organizer.logout));

// Admin — login only, account made manually in the DB
router.post("/admin/login", createLoginLimiter(), validate(schema.login), wrapAsync(auth.admin.login));
router.post("/admin/refresh", createRefreshLimiter(), wrapAsync(auth.admin.refreshToken));
router.post("/admin/logout", wrapAsync(auth.admin.logout));

module.exports = router;
