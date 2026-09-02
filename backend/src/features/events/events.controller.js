// Event lifecycle (models/Event.js), organizer-owned.
// Create / update / soft-delete (isActive), banner upload, formQuestions.
// Student-facing browse and detail live here too: active events by date, tag
// filter, text search.
// Event.price is authoritative - never accept an amount from the client.
const Event = require("../../models/Event");
const Community = require("../../models/Community");
const Like = require("../../models/Like");
const { notifyCommunityEvent, notifyEventUpdated } = require("../../services/notification.service");
const { deleteEverywhere } = require("../../utils/fileStorage");
const { sendSaveError } = require("../../utils/mongooseSaveError");

// Fields a registered participant actually sees/cares about. Deliberately
// excludes bookkeeping fields (isActive, expiresAt, autoDeleteAfterMonths,
// remindersSent, confirmedRegistrationIds, likesCount, viewCount,
// registrationStartedCount) so saving the organizer edit form without
// changing anything student-facing doesn't spam every registrant with an
// "event was updated" notification.
const EVENT_UPDATED_NOTIFY_FIELDS = [
    "title", "category", "description", "bannerImage", "venue",
    "eventDate", "eventEndDate", "registrationDeadline", "contact",
    "agenda", "rules", "faqs", "tags", "registrationType", "teamSize",
    "capacity", "price", "collectProfileData", "allowWaitlist",
    "requireWaiver", "waiverText", "confirmationMessage", "sendEmailReceipt",
    "formQuestions",
];

module.exports.createEvent = async (req, res) => {
    const community = req.user;

    const event = new Event({ community: community._id, ...req.body });

    try {
        await event.save();
    } catch (err) {
        if (sendSaveError(err, res)) return;
        throw err;
    }

    // Followers hear about an event only once it is actually reachable for
    // them. A draft 404s on the public getEvent path, so notifying at create
    // time would hand every follower a notification that leads nowhere —
    // the draft -> published transition in updateEvent fires it instead.
    if (event.status === "published") {
        await notifyCommunityEvent({ community: community._id, event: event._id });
    }

    return res.status(201).json({ message: "Event created", event });
};

// req.body is already whitelisted by Joi, so confirmedRegistrationIds and
// likesCount (hook-maintained, never client-editable) can't slip through.
module.exports.updateEvent = async (req, res) => {
    const community = req.user;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, community: community._id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const wasPublished = event.status === "published";

    Object.assign(event, req.body);

    // Must read before save() — Mongoose clears a document's modified-paths
    // tracking once it's been persisted, so isModified() is meaningless after.
    const hasStudentFacingChange = EVENT_UPDATED_NOTIFY_FIELDS.some((field) => event.isModified(field));

    try {
        await event.save();
    } catch (err) {
        if (sendSaveError(err, res)) return;
        throw err;
    }

    // Publishing is the moment the event becomes visible to students, so it —
    // not creation — is what followers get notified about. Guarded on the
    // transition so repeat PATCHes to an already-published event don't
    // re-notify everyone.
    if (!wasPublished && event.status === "published") {
        await notifyCommunityEvent({ community: community._id, event: event._id });
    }

    // Distinct from the followers-only notification above: this reaches
    // everyone already registered (confirmed/waitlisted leaders + accepted
    // team members), regardless of whether the edit touched publish state.
    // Gated on an actual student-facing change so re-saving the edit form
    // with no real change (or a purely internal field) doesn't re-notify
    // everyone for nothing.
    if (hasStudentFacingChange) {
        await notifyEventUpdated({ event: event._id });
    }

    return res.status(200).json({ message: "Event updated", event });
};

module.exports.deleteEvent = async (req, res) => {
    const community = req.user;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, community: community._id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.isActive = false;
    await event.save();

    return res.status(200).json({ message: "Event removed" });
};

module.exports.uploadBanner = async (req, res) => {
    const community = req.user;
    const { eventId } = req.params;

    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const event = await Event.findOne({ _id: eventId, community: community._id });
    if (!event) {
        await deleteEverywhere(req.file.filename, req.file.cloudinary.publicId);
        return res.status(404).json({ message: "Event not found" });
    }

    // Keep a reference to the existing banner but don't delete it yet - it
    // must stay recoverable until the new one is confirmed saved.
    const previousBanner = event.bannerImage?.cloudinaryId
        ? { filename: event.bannerImage.filename, cloudinaryId: event.bannerImage.cloudinaryId }
        : null;

    event.bannerImage = {
        url: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
        filename: req.file.filename,
    };

    try {
        await event.save();
    } catch (err) {
        // Save failed - the DB never ended up pointing at the new upload, so
        // clean it up here instead of orphaning it in Cloudinary.
        await deleteEverywhere(req.file.filename, req.file.cloudinary.publicId);
        if (sendSaveError(err, res)) return;
        throw err;
    }

    // Only now that the DB durably points at the new banner is it safe to
    // remove the old one.
    if (previousBanner) {
        await deleteEverywhere(previousBanner.filename, previousBanner.cloudinaryId);
    }

    return res.status(200).json({ message: "Event banner updated", event });
};

module.exports.removeBanner = async (req, res) => {
    const community = req.user;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, community: community._id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.bannerImage?.url) return res.status(400).json({ message: "No banner to remove" });

    const previousBanner = { filename: event.bannerImage.filename, cloudinaryId: event.bannerImage.cloudinaryId };

    event.bannerImage = undefined;
    await event.save();

    await deleteEverywhere(previousBanner.filename, previousBanner.cloudinaryId);

    return res.status(200).json({ message: "Event banner removed", event });
};

module.exports.getEvent = async (req, res) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate("community", "name logo");
    if (!event) return res.status(404).json({ message: "Event not found" });

    const isOwner = req.role === "organizer" && event.community?._id?.equals(req.user._id);
    if ((!event.isActive || event.status !== "published") && !isOwner) {
        return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ success: true, event });
};

// Events page default view: active events, soonest first, tag/search filters.
module.exports.listEvents = async (req, res) => {
    const { tag, search, page, limit } = req.query;

    // Concluded events are excluded rather than just sorted late: with
    // eventDate ascending and no lower bound, every event the campus has
    // ever run sorts ahead of the ones still to come, so page 1 of the hub
    // is the oldest history and nothing upcoming is reachable. An event is
    // over once its end has passed — eventEndDate for multi-day events,
    // eventDate otherwise ({field: null} also matches a missing field).
    const now = new Date();
    const filter = {
        isActive: true,
        status: "published",
        $or: [{ eventEndDate: { $gte: now } }, { eventEndDate: null, eventDate: { $gte: now } }],
    };
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
        Event.find(filter).sort({ eventDate: 1 }).skip(skip).limit(limit).populate("community", "name logo"),
        Event.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, events, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// A community's own event history — the owning organizer sees everything
// (including soft-deleted/past events); everyone else sees only active ones.
module.exports.listCommunityEvents = async (req, res) => {
    const { communityId } = req.params;
    const { page, limit } = req.query;

    const communityExists = await Community.exists({ _id: communityId });
    if (!communityExists) return res.status(404).json({ message: "Community not found" });

    const isOwner = req.role === "organizer" && req.user._id.equals(communityId);
    const filter = { community: communityId };
    if (!isOwner) {
        filter.isActive = true;
        filter.status = "published";
    }

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
        Event.find(filter).sort({ eventDate: -1 }).skip(skip).limit(limit),
        Event.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, events, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// Event.likesCount is the hook-maintained display cache; Like is the truth —
// same reactivate-soft-deleted-doc pattern as feed/likes.controller.js.
module.exports.likeEvent = async (req, res) => {
    const student = req.user;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, isActive: true });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Atomic guard: two concurrent re-likes must not both read the inactive
    // doc, both save(), and each fire the post-save hook's likesCount
    // increment (see feed/likes.controller.js for the full explanation).
    const reactivated = await Like.findOneAndUpdate(
        { student: student._id, target: eventId, targetType: "Event", isActive: false },
        { $set: { isActive: true, unlikedAt: null } },
    );

    if (reactivated) {
        await Event.findByIdAndUpdate(eventId, { $inc: { likesCount: 1 } });
        return res.status(201).json({ message: "Event liked" });
    }

    try {
        await new Like({ student: student._id, target: eventId, targetType: "Event" }).save();
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: "Already liked" });
        throw err;
    }

    return res.status(201).json({ message: "Event liked" });
};

module.exports.unlikeEvent = async (req, res) => {
    const student = req.user;
    const { eventId } = req.params;

    // Same atomic-guard fix: concurrent unlikes must not both decrement.
    const unliked = await Like.findOneAndUpdate(
        { student: student._id, target: eventId, targetType: "Event", isActive: true },
        { $set: { isActive: false, unlikedAt: new Date() } },
    );

    if (!unliked) return res.status(404).json({ message: "You have not liked this event" });

    await Event.findByIdAndUpdate(eventId, { $inc: { likesCount: -1 } });

    return res.status(200).json({ message: "Event unliked" });
};

// Engagement-funnel beacons for organizer analytics — fire-and-forget, no
// per-student dedupe (unlike Like), so a silent no-op on a missing/hidden
// event is fine: the caller doesn't depend on the result.
module.exports.trackEventView = async (req, res) => {
    const { eventId } = req.params;

    await Event.updateOne({ _id: eventId, isActive: true, status: "published" }, { $inc: { viewCount: 1 } });

    return res.status(200).json({ success: true });
};

module.exports.trackRegistrationStarted = async (req, res) => {
    const { eventId } = req.params;

    await Event.updateOne({ _id: eventId, isActive: true, status: "published" }, { $inc: { registrationStartedCount: 1 } });

    return res.status(200).json({ success: true });
};
