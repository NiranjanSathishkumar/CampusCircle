// Reading community login history (models/AuditLog.js).
// Login-level accountability only - a shared organizer login is deliberately
// not attributed to an individual person.
// Records self-expire after 180 days via a TTL index.
// Writing happens in services/audit.service.js, called from the login flow.
const AuditLog = require("../../models/AuditLog");

module.exports.listAuditLogs = async (req, res) => {
    const { community, page, limit } = req.query;

    const filter = {};
    if (community) filter.community = community;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("community", "name email"),
        AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, logs, page, limit, total, totalPages: Math.ceil(total / limit) });
};
