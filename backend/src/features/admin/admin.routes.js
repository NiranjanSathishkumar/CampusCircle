const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth, requireRole } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { getSelf, createOrganizer, listOrganizers, updateOrganizerStatus, listStudents } = require("./admin.controller");
const { listAuditLogs } = require("./audit.controller");
const { getDashboardOverview } = require("./dashboard.controller");
const schema = require("./admin.validators");
const router = require("express").Router();

// Mounted at /api/admin. Admin login lives in features/auth; everything here is
// an authenticated admin action, so the guards sit on the router.
router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/me", wrapAsync(getSelf));

router.get("/dashboard", wrapAsync(getDashboardOverview));

router.route("/organizers")
    .get(validate(schema.listOrganizersQuery, "query"), wrapAsync(listOrganizers))
    .post(validate(schema.createOrganizer), wrapAsync(createOrganizer));

router.route("/organizers/:organizerId/status")
    .patch(validate(schema.organizerParams, "params"), validate(schema.updateOrganizerStatus), wrapAsync(updateOrganizerStatus));

router.get("/audit-logs", validate(schema.auditLogsQuery, "query"), wrapAsync(listAuditLogs));

router.get("/students", validate(schema.listStudentsQuery, "query"), wrapAsync(listStudents));

module.exports = router;
