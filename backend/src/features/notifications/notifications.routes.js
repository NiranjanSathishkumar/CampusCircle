// Notification routes. Mount at /api/notifications.
// Student and organizer: list, unread count, mark one read, mark all read.
// Which account's notifications a request sees is scoped by req.role inside
// the controller (recipientType: User vs Community) - never by a route param.
const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const { requireAuth, requireRole } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const schema = require("./notifications.validators");

const {
    listNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
} = require("./notifications.controller");

router.use(requireAuth);
router.use(requireRole("student", "organizer"));

router.route("/")
    .get(validate(schema.listQuery, "query"), wrapAsync(listNotifications));

router.route("/unread-count")
    .get(wrapAsync(getUnreadCount));

router.route("/read-all")
    .patch(wrapAsync(markAllAsRead));

router.route("/clear-read")
    .delete(wrapAsync(clearReadNotifications));

router.route("/:notificationId/read")
    .patch(validate(schema.notificationParams, "params"), wrapAsync(markAsRead));

router.route("/:notificationId")
    .delete(validate(schema.notificationParams, "params"), wrapAsync(deleteNotification));

module.exports = router;

