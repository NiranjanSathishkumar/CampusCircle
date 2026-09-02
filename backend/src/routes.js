const router = require("express").Router();

const authRoutes = require("./features/auth/auth.routes");
const adminRoutes = require("./features/admin/admin.routes");
const studentsRoutes = require("./features/students/students.routes");
const communitiesRoutes = require("./features/communities/communities.routes");
const communityDiscoveryRoutes = require("./features/communities/discovery.routes");
const followsRoutes = require("./features/follows/follows.routes");
const feedRoutes = require("./features/feed/feed.routes");
const recruitmentRoutes = require("./features/recruitment/recruitment.routes");
const notificationsRoutes = require("./features/notifications/notifications.routes");
const eventsRoutes = require("./features/events/events.routes");
const buddiesRoutes = require("./features/students/buddies.routes");

// Auth mounts first on purpose: it declares exact public paths (e.g.
// /api/organizer/login) that sit under prefixes whose routers are role-guarded.
// /api/organizer is auth-only (login/refresh/logout); the organizer's own
// community lives at /api/community, mirroring /api/profile for students.
// /api/communities (plural) is the read-only discovery surface any
// authenticated role can browse - deliberately a separate router rather
// than another route on communitiesRoutes, which is organizer-only end to end.
router.use("/api", authRoutes);
router.use("/api/admin", adminRoutes);
router.use("/api/profile", studentsRoutes);
router.use("/api/community", communitiesRoutes);
router.use("/api/communities", communityDiscoveryRoutes);
router.use("/api/buddies", buddiesRoutes);
router.use("/api/follows", followsRoutes);
router.use("/api/feed", feedRoutes);
router.use("/api/recruitment", recruitmentRoutes);
router.use("/api/notifications", notificationsRoutes);
router.use("/api/events", eventsRoutes);

// ── Not built yet ────────────────────────────────────────────────────────────
// Scaffolded under features/; uncomment each line once its router exports an
// express.Router(). /api/payments must be mounted before express.json() in
// app.js if the Razorpay webhook needs the raw body for signature verification.
//
// router.use("/api/payments",      require("./features/payments/payments.routes"));

module.exports = router;
