// Writes AuditLog entries. Called from the organizer login flow with the
// request's userAgent and IP address.
// A failure here must be logged and swallowed - it should never block a login.
const AuditLog = require("../models/AuditLog");

module.exports.recordOrganizerLogin = async ({ community, userAgent, ipAddress }) => {
    try {
        await AuditLog.create({ community, userAgent, ipAddress });
    } catch (err) {
        console.error("[audit.service] failed to record organizer login:", err);
    }
};
