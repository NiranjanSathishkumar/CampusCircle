// Organizer dashboard overview — read-only aggregation surface for
// OrganizerDashboardPage. Mounted onto the /api/community router alongside
// communities.controller.js, so it inherits requireAuth + requireRole
// ("organizer") + req.community from communities.routes.js.
//
// Mirrors analytics.controller.js's shape (one aggregation endpoint per
// page) rather than several small ones, since every stat here is read
// together on a single page load.
const Event = require("../../models/Event");
const Registration = require("../../models/Registration");
const Follow = require("../../models/Follow");
const CommunityRecruitment = require("../../models/CommunityRecruitment");
const CommunityApplication = require("../../models/CommunityApplication");

const DAY_MS = 24 * 60 * 60 * 1000;

// "week"/"month" are rolling windows off now; "all" is since the community
// itself was created, so a brand-new community doesn't show a misleading
// 100% spike against a window that predates it.
function resolveWindowStart(timeframe, communityCreatedAt) {
    const now = Date.now();
    if (timeframe === "month") return new Date(now - 30 * DAY_MS);
    if (timeframe === "all") return communityCreatedAt || new Date(0);
    return new Date(now - 7 * DAY_MS);
}

// Percentage growth of "new in window" against "what existed before the
// window" — not new/total, so a community that doubled its followers this
// week reads as +100%, not +50%.
function growthPercent(newInWindow, currentTotal) {
    const priorTotal = currentTotal - newInWindow;
    if (priorTotal <= 0) return newInWindow > 0 ? 100 : 0;
    return Math.round((newInWindow / priorTotal) * 100);
}

module.exports.getDashboardOverview = async (req, res) => {
    const community = req.community;
    const communityId = community._id;
    const timeframe = req.query.timeframe;
    const windowStart = resolveWindowStart(timeframe, community.createdAt);
    const now = new Date();

    const [events, drives] = await Promise.all([
        Event.find(
            { community: communityId, isActive: true },
            "title category venue eventDate eventEndDate capacity confirmedRegistrationIds status bannerImage createdAt"
        ).lean(),
        CommunityRecruitment.find({ community: communityId, isActive: true }).lean(),
    ]);

    const eventIds = events.map((e) => e._id);
    const driveIds = drives.map((d) => d._id);

    const totalConfirmedRegistrations = events.reduce(
        (sum, e) => sum + (e.confirmedRegistrationIds?.length || 0),
        0
    );
    const eventsHosted = events.filter((e) => e.status === "published" && e.eventDate < now).length;

    const upcoming = events
        .filter((e) => e.status === "published" && e.eventDate >= now)
        .sort((a, b) => a.eventDate - b.eventDate);
    const nextEventDoc = upcoming[0] || null;

    const openDriveIds = drives.filter((d) => d.isOpen).map((d) => d._id);

    // Soonest deadline first (undated drives sort last), tie-broken by most
    // recently opened — the drive most in need of organizer attention.
    const openDrives = drives
        .filter((d) => d.isOpen)
        .sort((a, b) => {
            if (a.deadline && b.deadline) return a.deadline - b.deadline;
            if (a.deadline) return -1;
            if (b.deadline) return 1;
            return b.createdAt - a.createdAt;
        });
    const activeDriveDoc = openDrives[0] || null;

    const [
        newFollowers,
        newRegistrations,
        nextEventWaitlistCount,
        activeDriveApplicationsCount,
        pendingApplications,
        recentRegistrations,
        recentApplications,
    ] = await Promise.all([
        Follow.countDocuments({
            following: communityId,
            followingType: "Community",
            isActive: true,
            createdAt: { $gte: windowStart },
        }),
        eventIds.length
            ? Registration.countDocuments({
                  event: { $in: eventIds },
                  status: { $in: ["confirmed", "waitlisted"] },
                  createdAt: { $gte: windowStart },
              })
            : 0,
        nextEventDoc
            ? Registration.countDocuments({ event: nextEventDoc._id, status: "waitlisted" })
            : 0,
        activeDriveDoc ? CommunityApplication.countDocuments({ recruitment: activeDriveDoc._id }) : 0,
        openDriveIds.length
            ? CommunityApplication.countDocuments({ recruitment: { $in: openDriveIds }, status: "pending" })
            : 0,
        eventIds.length
            ? Registration.find({ event: { $in: eventIds }, status: { $in: ["confirmed", "waitlisted"] } })
                  .sort({ createdAt: -1 })
                  .limit(8)
                  .populate("student", "name")
                  .populate("event", "title")
                  .lean()
            : [],
        driveIds.length
            ? CommunityApplication.find({ recruitment: { $in: driveIds } })
                  .sort({ createdAt: -1 })
                  .limit(8)
                  .populate("student", "name")
                  .populate("recruitment", "title")
                  .lean()
            : [],
    ]);

    const activityFeed = [
        ...recentRegistrations.map((r) => ({
            id: String(r._id),
            type: "registration",
            text: `${r.student?.name || "A student"} registered for ${r.event?.title || "an event"}`,
            time: r.createdAt,
            eventId: r.event?._id ? String(r.event._id) : null,
        })),
        ...recentApplications.map((a) => ({
            id: String(a._id),
            type: "application",
            text: `${a.student?.name || "A student"} applied for ${a.recruitment?.title || "a position"}`,
            time: a.createdAt,
            recruitmentId: a.recruitment?._id ? String(a.recruitment._id) : null,
        })),
    ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);

    return res.status(200).json({
        success: true,
        stats: {
            followers: community.followerCount || 0,
            followersDeltaPct: growthPercent(newFollowers, community.followerCount || 0),
            activeRegistrations: totalConfirmedRegistrations,
            registrationsDeltaPct: growthPercent(newRegistrations, totalConfirmedRegistrations),
            pendingApplications,
            eventsHosted,
        },
        nextEvent: nextEventDoc
            ? {
                  id: String(nextEventDoc._id),
                  title: nextEventDoc.title,
                  category: nextEventDoc.category,
                  venue: nextEventDoc.venue,
                  eventDate: nextEventDoc.eventDate,
                  eventEndDate: nextEventDoc.eventEndDate,
                  capacity: nextEventDoc.capacity,
                  registeredCount: nextEventDoc.confirmedRegistrationIds?.length || 0,
                  waitlistCount: nextEventWaitlistCount,
                  imageUrl: nextEventDoc.bannerImage?.url || null,
              }
            : null,
        activeDrive: activeDriveDoc
            ? {
                  id: String(activeDriveDoc._id),
                  title: activeDriveDoc.title,
                  description: activeDriveDoc.description,
                  deadline: activeDriveDoc.deadline,
                  applicationsCount: activeDriveApplicationsCount,
              }
            : null,
        activityFeed,
    });
};
