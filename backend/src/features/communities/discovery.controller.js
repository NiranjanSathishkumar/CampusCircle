// Public community discovery - any authenticated role (student, organizer,
// admin) can browse the directory and open a community's detail page.
// Distinct from communities.controller.js, which is the organizer-only
// self-management surface mounted at /api/community.
const Community = require("../../models/Community");
const Event = require("../../models/Event");
const CommunityRecruitment = require("../../models/CommunityRecruitment");

// Both the list and detail responses return the same shape (full document,
// coreTeam enriched, email excluded) - community counts here are small
// (campus clubs, not thousands of rows), so there's no payload-size reason
// to give the discovery grid a leaner projection than the detail page, and
// keeping them identical means the frontend has exactly one adapter to
// normalize either response into its view model instead of two.
//
// email isn't select: false on Community (unlike password/refreshTokens/
// reset-token fields) - it's the shared organizer login, not a public
// profile field, so it must be excluded explicitly on every read here.
const PUBLIC_SELECT = "-email";
const CORE_TEAM_POPULATE = { path: "coreTeam.user", select: "name branch yearOfJoining profilePicture" };

// Attaches each community's few nearest still-upcoming active events (for
// the card/detail "events" preview) and its total upcoming-event count in a
// single aggregate query, rather than one query per community. Expects
// `communities` to already be plain lean objects (spread with `...c` below),
// not live Mongoose documents.
async function attachUpcomingEvents(communities) {
    const communityIds = communities.map((c) => c._id);
    const rows = await Event.aggregate([
        { $match: { community: { $in: communityIds }, isActive: true, eventDate: { $gte: new Date() } } },
        { $sort: { eventDate: 1 } },
        {
            $group: {
                _id: "$community",
                count: { $sum: 1 },
                events: { $push: { _id: "$_id", title: "$title", eventDate: "$eventDate", tags: "$tags" } },
            },
        },
        { $project: { count: 1, events: { $slice: ["$events", 3] } } },
    ]);
    const byId = new Map(rows.map((r) => [String(r._id), r]));

    return communities.map((c) => {
        const row = byId.get(String(c._id));
        return {
            ...c,
            activeEventsCount: row?.count || 0,
            upcomingEvents: row?.events || [],
        };
    });
}

// isRecruiting is a manual, organizer-set banner flag - separate from
// CommunityRecruitment (the structured drives students actually apply
// through, see recruitment.controller.js). The two can drift apart (a
// community running a live open drive that forgot to flip the flag, or
// vice versa), so both the ?recruiting= filter below and hasOpenRecruitment
// on each returned community fold in actual open drives rather than
// trusting the flag alone - mirrors the same OR fallback the community
// detail page already applies client-side (CommunityDetailPanel.jsx).
//
// Also returns each open drive's title, keyed by community: the directory
// card's "Open Role: X" teaser used to read from Community.openRoles, a
// free-text field organizers set independently of actual drives, which let
// it name roles (or claim "Recruiting" at all) with zero live drives behind
// them - a dead end once a student clicked through to Open Roles. Sourcing
// the teaser from real open-drive titles instead means it can never name a
// position students can't actually apply to.
async function communityIdsWithOpenDrive(communityIds) {
    const drives = await CommunityRecruitment.find(
        {
            community: { $in: communityIds },
            isActive: true,
            isOpen: true,
            $or: [{ deadline: null }, { deadline: { $gte: new Date() } }],
        },
        { community: 1, title: 1 },
    ).lean();

    const titlesById = new Map();
    for (const drive of drives) {
        const key = String(drive.community);
        if (!titlesById.has(key)) titlesById.set(key, []);
        titlesById.get(key).push(drive.title);
    }
    return titlesById;
}

module.exports.listCommunities = async (req, res) => {
    const { category, search, recruiting, page, limit } = req.query;

    // Only ever active communities - isActive is an admin-only moderation
    // flag (see Community.js), never a student-facing filter.
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    if (recruiting === true || recruiting === "true") {
        const openDriveCommunityIds = await CommunityRecruitment.distinct("community", {
            isActive: true,
            isOpen: true,
            $or: [{ deadline: null }, { deadline: { $gte: new Date() } }],
        });
        filter._id = { $in: openDriveCommunityIds };
    } else if (recruiting === false || recruiting === "false") {
        const openDriveCommunityIds = await CommunityRecruitment.distinct("community", {
            isActive: true,
            isOpen: true,
            $or: [{ deadline: null }, { deadline: { $gte: new Date() } }],
        });
        filter._id = { $nin: openDriveCommunityIds };
    }

    const skip = (page - 1) * limit;
    const [communities, total] = await Promise.all([
        Community.find(filter)
            .select(PUBLIC_SELECT)
            .populate(CORE_TEAM_POPULATE)
            .sort({ followerCount: -1, name: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Community.countDocuments(filter),
    ]);

    const openDriveTitles = await communityIdsWithOpenDrive(communities.map((c) => c._id));
    const results = (await attachUpcomingEvents(communities)).map((c) => {
        const titles = openDriveTitles.get(String(c._id));
        return { ...c, hasOpenRecruitment: Boolean(titles && titles.length > 0), openRecruitmentRoles: titles || [] };
    });

    return res.status(200).json({
        success: true,
        communities: results,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
};

module.exports.getCommunityById = async (req, res) => {
    const { communityId } = req.params;

    const community = await Community.findOne({ _id: communityId, isActive: true })
        .select(PUBLIC_SELECT)
        .populate(CORE_TEAM_POPULATE)
        .lean();

    if (!community) {
        return res.status(404).json({ message: "Community not found" });
    }

    const [withEvents] = await attachUpcomingEvents([community]);
    const openDriveTitles = await communityIdsWithOpenDrive([community._id]);
    const titles = openDriveTitles.get(String(community._id));

    return res.status(200).json({
        success: true,
        community: { ...withEvents, hasOpenRecruitment: Boolean(titles && titles.length > 0), openRecruitmentRoles: titles || [] },
    });
};
