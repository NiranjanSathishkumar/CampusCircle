// Admin Console landing page — platform-wide counts and a merged activity
// feed. Unlike the organizer dashboard (per-community, timeframe-scoped),
// this is a flat overview: no per-admin scoping, no growth deltas, since
// there's exactly one admin identity and nothing here is "theirs" to compare
// against a prior window.
const Community = require("../../models/Community");
const { User } = require("../../models/User");
const Event = require("../../models/Event");
const AuditLog = require("../../models/AuditLog");

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_FEED_LIMIT = 8;
const RECENT_WINDOW_LIMIT = 5;

module.exports.getDashboardOverview = async (req, res) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS);

    const [
        totalCommunities,
        totalStudents,
        totalEvents,
        recentLogins,
        categoryBreakdown,
        recentCommunities,
        recentStudents,
        recentLoginEvents,
    ] = await Promise.all([
        Community.countDocuments(),
        User.countDocuments(),
        Event.countDocuments({ isActive: true, status: "published" }),
        AuditLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Community.aggregate([
            { $group: { _id: "$category", value: { $sum: 1 } } },
            { $sort: { value: -1 } },
        ]),
        Community.find().select("name createdAt").sort({ createdAt: -1 }).limit(RECENT_WINDOW_LIMIT).lean(),
        User.find().select("name createdAt").sort({ createdAt: -1 }).limit(RECENT_WINDOW_LIMIT).lean(),
        AuditLog.find().select("community createdAt").sort({ createdAt: -1 }).limit(RECENT_WINDOW_LIMIT)
            .populate("community", "name").lean(),
    ]);

    const activityFeed = [
        ...recentCommunities.map((c) => ({
            id: String(c._id),
            type: "community",
            text: `${c.name} community created`,
            time: c.createdAt,
        })),
        ...recentStudents.map((s) => ({
            id: String(s._id),
            type: "student",
            text: `${s.name} joined as a student`,
            time: s.createdAt,
        })),
        ...recentLoginEvents.map((l) => ({
            id: String(l._id),
            type: "login",
            text: `Shared-login access on ${l.community?.name || "a community"}`,
            time: l.createdAt,
        })),
    ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, ACTIVITY_FEED_LIMIT);

    return res.status(200).json({
        success: true,
        stats: {
            totalCommunities,
            totalStudents,
            totalEvents,
            recentLogins,
        },
        categoryBreakdown: categoryBreakdown.map((c) => ({ label: c._id || "Uncategorized", value: c.value })),
        activityFeed,
    });
};
