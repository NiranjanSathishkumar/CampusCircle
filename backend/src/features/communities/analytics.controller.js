// Organizer-facing community analytics — read-only aggregation surface for
// the Analytics page. Mounted onto the /api/community router alongside
// communities.controller.js, so it inherits requireAuth + requireRole
// ("organizer") + req.community from communities.routes.js.
const Follow = require("../../models/Follow");
const Event = require("../../models/Event");
const Registration = require("../../models/Registration");
const { User } = require("../../models/User");

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR_LABELS = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

// Cumulative "followers as of end of month" series from a list of follow
// createdAt dates — ignores churn (unfollows), same simplification the old
// mock's always-increasing curve made.
function buildFollowerGrowth(createdAts) {
    if (!createdAts.length) return [];

    const buckets = new Map(); // "YYYY-MM" -> count that month
    for (const date of createdAts) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    const keys = [...buckets.keys()].sort();
    let cumulative = 0;
    return keys.map((key) => {
        cumulative += buckets.get(key);
        const month = Number(key.split("-")[1]);
        return { label: MONTH_LABELS[month - 1], value: cumulative, date: `${key}-01` };
    });
}

function buildComposition(rows, keyFn) {
    const counts = new Map();
    for (const row of rows) {
        const key = keyFn(row);
        if (key == null) continue;
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
}

module.exports.getOverviewAnalytics = async (req, res) => {
    const communityId = req.community._id;

    const [followerRows, eventDocs] = await Promise.all([
        Follow.aggregate([
            { $match: { following: communityId, followingType: "Community", isActive: true } },
            { $lookup: { from: User.collection.name, localField: "follower", foreignField: "_id", as: "u" } },
            { $unwind: "$u" },
            { $project: { createdAt: 1, branch: "$u.branch", yearOfJoining: "$u.yearOfJoining" } },
        ]),
        Event.find({ community: communityId }, "title isActive confirmedRegistrationIds").lean(),
    ]);

    const eventIds = eventDocs.map((e) => e._id);
    const eventRegistrants = eventDocs.reduce((sum, e) => sum + (e.confirmedRegistrationIds?.length || 0), 0);

    // Students checked in (as registration leader) to 2+ distinct events for
    // this community. Team-member attendance isn't folded in here — a
    // deliberate simplification, not an oversight.
    const repeatAttendeeRows = eventIds.length
        ? await Registration.aggregate([
              { $match: { event: { $in: eventIds }, checkedIn: true } },
              { $group: { _id: { student: "$student", event: "$event" } } },
              { $group: { _id: "$_id.student", eventsAttended: { $sum: 1 } } },
              { $match: { eventsAttended: { $gte: 2 } } },
              { $count: "count" },
          ])
        : [];

    const followerGrowth = buildFollowerGrowth(followerRows.map((r) => r.createdAt));
    const branchComposition = buildComposition(followerRows, (r) => r.branch || null);
    const yearComposition = buildComposition(
        followerRows,
        (r) => YEAR_LABELS[User.computeCurrentYear(r.yearOfJoining)] || null
    );

    const topEvents = eventDocs
        .filter((e) => e.isActive)
        .map((e) => ({ id: e._id, title: e.title, registrations: e.confirmedRegistrationIds?.length || 0 }))
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 5);

    const engagementFunnel = [
        { label: "Followers", value: req.community.followerCount || 0 },
        { label: "Event Registrants", value: eventRegistrants },
        { label: "Repeat Attendees", value: repeatAttendeeRows[0]?.count || 0 },
    ];

    return res.status(200).json({
        success: true,
        followerGrowth,
        branchComposition,
        yearComposition,
        engagementFunnel,
        topEvents,
    });
};
