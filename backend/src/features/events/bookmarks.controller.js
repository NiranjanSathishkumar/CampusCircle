// Event bookmarks (models/Bookmark.js) - events only, not posts.
// Student: bookmark / unbookmark / list own, unique per {student, event}.
const Bookmark = require("../../models/Bookmark");
const Event = require("../../models/Event");

// Bookmarks pointing at a soft-deleted event must drop out BEFORE the page
// window is applied. Paginating first and filtering the populated results
// afterwards (the shape this used to have) left short pages and a totalPages
// computed from a different, smaller population than the one being sliced —
// so the tail of a student's bookmark list became unreachable. Doing the
// isActive join inside the aggregate keeps the page window and the total
// counting the same set.
async function pageBookmarksWithActiveEvent(filter, skip, limit) {
    const [result] = await Bookmark.aggregate([
        { $match: filter },
        { $lookup: { from: Event.collection.name, localField: "event", foreignField: "_id", as: "e" } },
        // Dot-notation into the lookup array: matches when the single joined
        // event is active, and drops rows whose event no longer exists.
        { $match: { "e.isActive": true } },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                page: [{ $skip: skip }, { $limit: limit }, { $project: { _id: 1 } }],
                total: [{ $count: "count" }],
            },
        },
    ]);

    return { ids: result.page.map((row) => row._id), total: result.total[0]?.count ?? 0 };
}

module.exports.bookmarkEvent = async (req, res) => {
    const student = req.user;
    const { eventId } = req.params;

    const eventExists = await Event.exists({ _id: eventId, isActive: true });
    if (!eventExists) return res.status(404).json({ message: "Event not found" });

    try {
        const bookmark = await Bookmark.create({ student: student._id, event: eventId });
        return res.status(201).json({ message: "Event bookmarked", bookmark });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: "Already bookmarked" });
        throw err;
    }
};

module.exports.unbookmarkEvent = async (req, res) => {
    const student = req.user;
    const { eventId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({ student: student._id, event: eventId });
    if (!bookmark) return res.status(404).json({ message: "Bookmark not found" });

    return res.status(200).json({ message: "Bookmark removed" });
};

// "My bookmarks" list, most recently bookmarked first.
module.exports.listMyBookmarks = async (req, res) => {
    const student = req.user;
    const { page, limit } = req.query;

    const filter = { student: student._id };
    const skip = (page - 1) * limit;

    // The aggregate picks the page; this re-reads those ids as real documents
    // so `event` can be populated the ordinary way (aggregates can't run
    // mongoose populate, and the nested community populate needs it).
    const { ids, total } = await pageBookmarksWithActiveEvent(filter, skip, limit);
    const bookmarks = ids.length
        ? await Bookmark.find({ _id: { $in: ids } })
            .sort({ createdAt: -1 })
            .populate({ path: "event", populate: { path: "community", select: "name logo" } })
        : [];

    return res.status(200).json({ success: true, bookmarks, page, limit, total, totalPages: Math.ceil(total / limit) });
};
