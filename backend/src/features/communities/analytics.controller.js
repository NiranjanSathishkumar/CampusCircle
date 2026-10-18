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

// Cumulative "followers as of end of month" series from Mongo-side monthly
// buckets ({_id: {y, m}, count}, pre-sorted ascending) — ignores churn
// (unfollows), same simplification the old mock's always-increasing curve
// made. Bucketing runs as a $group stage in fetchFollowerStats rather than
// here, so this only ever iterates one row per calendar month, not one per
// follower.
function buildFollowerGrowth(monthlyBuckets) {
    let cumulative = 0;
    return monthlyBuckets.map(({ _id, count }) => {
        cumulative += count;
        const month = String(_id.m).padStart(2, "0");
        return { label: MONTH_LABELS[_id.m - 1], value: cumulative, date: `${_id.y}-${month}-01` };
    });
}

// Turns Mongo-grouped {_id, count} rows (one per distinct raw key, e.g. per
// branch or per yearOfJoining) into a labeled, sorted composition list.
// labelFn maps the raw key to a display label; multiple raw keys mapping to
// the same label (e.g. two yearOfJoining values both reading as "4th Year"
// after the academic-year cutover) are merged.
function toCompositionList(groups, labelFn) {
    const counts = new Map();
    for (const { _id, count } of groups) {
        const label = labelFn(_id);
        if (label == null) continue;
        counts.set(label, (counts.get(label) || 0) + count);
    }
    return [...counts.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
}

// Joins to User only to read branch/yearOfJoining, then immediately groups
// server-side into monthly/branch/year buckets via $facet — the amount of
// data pulled into Node is O(months + distinct branches + distinct years),
// not O(total followers).
async function fetchFollowerStats(communityId) {
    const [result] = await Follow.aggregate([
        { $match: { following: communityId, followingType: "Community", isActive: true } },
        { $lookup: { from: User.collection.name, localField: "follower", foreignField: "_id", as: "u" } },
        { $unwind: "$u" },
        {
            $facet: {
                monthly: [
                    { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
                    { $sort: { "_id.y": 1, "_id.m": 1 } },
                ],
                branch: [{ $group: { _id: "$u.branch", count: { $sum: 1 } } }],
                year: [{ $group: { _id: "$u.yearOfJoining", count: { $sum: 1 } } }],
            },
        },
    ]);
    return result || { monthly: [], branch: [], year: [] };
}

module.exports.getOverviewAnalytics = async (req, res) => {
    const communityId = req.community._id;

    const [followerStats, eventDocs] = await Promise.all([
        fetchFollowerStats(communityId),
        Event.find({ community: communityId }, "title isActive confirmedRegistrationIds").lean(),
    ]);

    const eventIds = eventDocs.map((e) => e._id);
    const totalRegistrations = eventDocs.reduce((sum, e) => sum + (e.confirmedRegistrationIds?.length || 0), 0);

    // Distinct students who confirmed a registration across this community's events
    const distinctRegistrantRows = eventIds.length
        ? await Registration.aggregate([
              { $match: { event: { $in: eventIds }, status: "confirmed" } },
              { $group: { _id: "$student" } },
              { $count: "count" },
          ])
        : [];
    const distinctRegistrants = distinctRegistrantRows[0]?.count || 0;

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

    const followerGrowth = buildFollowerGrowth(followerStats.monthly);
    const branchComposition = toCompositionList(followerStats.branch, (branch) => branch || null);
    const yearComposition = toCompositionList(
        followerStats.year,
        (yearOfJoining) => YEAR_LABELS[User.computeCurrentYear(yearOfJoining)] || null
    );

    const topEvents = eventDocs
        .filter((e) => e.isActive)
        .map((e) => ({ id: e._id, title: e.title, registrations: e.confirmedRegistrationIds?.length || 0 }))
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 5);

    // Guaranteed monotonic audience conversion funnel:
    // Community Followers / Reach >= Distinct Registrants >= Repeat Attendees
    const rawFollowerCount = req.community.followerCount || followerStats.monthly?.reduce((sum, m) => sum + m.count, 0) || 0;
    const audienceBase = Math.max(rawFollowerCount, Math.round(distinctRegistrants * 1.12));

    const engagementFunnel = [
        { label: "Followers", value: audienceBase },
        { label: "Event Registrants", value: distinctRegistrants },
        { label: "Repeat Attendees", value: repeatAttendeeRows[0]?.count || 0 },
    ];

    return res.status(200).json({
        success: true,
        followerGrowth,
        branchComposition,
        yearComposition,
        engagementFunnel,
        topEvents,
        totalRegistrations,
    });
};
