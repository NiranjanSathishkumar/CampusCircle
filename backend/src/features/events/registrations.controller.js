// Solo and team registration (models/Registration.js).
// The capacity gate is an atomic findOneAndUpdate against
// Event.confirmedRegistrationIds ($expr/$size): over capacity becomes
// "waitlisted", not a rejection. status has no default and must be set explicitly.
// Cancelling frees a slot - promote the oldest waitlisted entry and fire a
// waitlist_promotion notification.
const mongoose = require("mongoose");
const Event = require("../../models/Event");
const Registration = require("../../models/Registration");
const TeamMember = require("../../models/TeamMember");
const { User } = require("../../models/User");
const ExpressError = require("../../utils/ExpressError");
const buildAnswers = require("../../utils/buildAnswers");
const buildProfileSnapshot = require("../../utils/buildProfileSnapshot");
const { notifyWaitlistPromotion, notifyTeamInvite, notifyEventRegistration } = require("../../services/notification.service");
const { isRegistrationClosed } = require("../../utils/registrationWindow");

// Atomically reserves a confirmed slot if one is free, otherwise waitlists
// (or rejects, if the event disallows it). The registrationId is generated
// up front so it can be pushed into confirmedRegistrationIds in the same
// atomic step that decides the outcome — no read-then-write race window.
async function reserveSlot(event) {
    const registrationId = new mongoose.Types.ObjectId();

    const reserved = await Event.findOneAndUpdate(
        { _id: event._id, $expr: { $lt: [{ $size: "$confirmedRegistrationIds" }, "$capacity"] } },
        { $push: { confirmedRegistrationIds: registrationId } },
        { new: true },
    );

    if (reserved) return { registrationId, status: "confirmed", reservedSlot: true };

    if (event.allowWaitlist) return { registrationId, status: "waitlisted", reservedSlot: false };

    throw new ExpressError(400, "This event is full");
}

async function releaseSlot(eventId, registrationId) {
    await Event.updateOne({ _id: eventId }, { $pull: { confirmedRegistrationIds: registrationId } });
}

module.exports.registerForEvent = async (req, res) => {
    const student = req.user;
    const { eventId } = req.params;
    const { teamName, answers, teamMembers } = req.body;

    const event = await Event.findOne({ _id: eventId, isActive: true });
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (isRegistrationClosed(event)) {
        return res.status(400).json({ message: "Registration deadline has passed" });
    }

    if (event.registrationType === "solo") {
        if (teamName || teamMembers?.length) {
            return res.status(400).json({ message: "This is a solo-registration event" });
        }
    } else {
        if (!teamName) return res.status(400).json({ message: "teamName is required for a team event" });

        const rosterSize = 1 + (teamMembers?.length || 0);
        if (rosterSize < event.teamSize.min || rosterSize > event.teamSize.max) {
            return res.status(400).json({
                message: `Team size must be between ${event.teamSize.min} and ${event.teamSize.max} (including yourself)`,
            });
        }

        // A leader who is already someone else's TeamMember for this event
        // isn't caught by the Registration unique index (that only guards
        // leader-vs-leader), so check the other collection explicitly.
        const leaderAlreadyOnATeam = await TeamMember.exists({ event: eventId, student: student._id });
        if (leaderAlreadyOnATeam) {
            return res.status(400).json({ message: "You are already on a team for this event" });
        }
    }

    const alreadyRegisteredLeader = await Registration.exists({
        event: eventId,
        student: student._id,
        status: { $in: ["confirmed", "waitlisted"] },
    });
    if (alreadyRegisteredLeader) {
        return res.status(400).json({ message: "You have already registered for this event" });
    }

    const profileSnapshot = event.collectProfileData ? buildProfileSnapshot(student, "registering") : undefined;
    const leaderAnswers = buildAnswers(event.formQuestions, answers);

    let memberDrafts = [];
    if (teamMembers?.length) {
        const memberIds = teamMembers.map((m) => m.studentId);

        if (memberIds.some((id) => String(id) === String(student._id))) {
            return res.status(400).json({ message: "You are already the team leader — don't list yourself as a member" });
        }
        if (new Set(memberIds.map(String)).size !== memberIds.length) {
            return res.status(400).json({ message: "Duplicate team member" });
        }

        const existingCount = await User.countDocuments({ _id: { $in: memberIds } });
        if (existingCount !== memberIds.length) {
            return res.status(404).json({ message: "One or more team members were not found" });
        }

        const alreadyOnATeam = await TeamMember.exists({ event: eventId, student: { $in: memberIds } });
        if (alreadyOnATeam) {
            return res.status(400).json({ message: "One or more team members are already on a team for this event" });
        }

        // A member who is already leading (or on the waitlist for) their own
        // Registration for this event isn't caught by TeamMember's unique
        // index either - same cross-collection gap as above.
        const alreadyRegistered = await Registration.exists({
            event: eventId,
            student: { $in: memberIds },
            status: { $in: ["confirmed", "waitlisted"] },
        });
        if (alreadyRegistered) {
            return res.status(400).json({ message: "One or more team members are already registered for this event" });
        }

        memberDrafts = teamMembers.map((m) => ({
            event: eventId,
            student: m.studentId,
            answers: buildAnswers(event.formQuestions, m.answers),
        }));
    }

    const { registrationId, status, reservedSlot } = await reserveSlot(event);

    const registration = new Registration({
        _id: registrationId,
        event: event._id,
        student: student._id,
        teamName,
        status,
        answers: leaderAnswers,
        profileSnapshot,
        paymentStatus: event.price > 0 ? "pending" : "not_required",
    });

    let invitedMembers = [];
    try {
        await registration.save();
        if (memberDrafts.length) {
            invitedMembers = await TeamMember.insertMany(memberDrafts.map((m) => ({ ...m, registration: registrationId })));
        }
    } catch (err) {
        if (reservedSlot) await releaseSlot(event._id, registrationId);
        await Registration.deleteOne({ _id: registrationId });
        await TeamMember.deleteMany({ registration: registrationId });

        if (err.code === 11000) {
            if (err.keyPattern && err.keyPattern.student && memberDrafts.length) {
                return res.status(400).json({ message: "One or more team members are already on a team for this event" });
            }
            return res.status(400).json({ message: "You have already registered for this event" });
        }
        if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
        throw err;
    }

    // Invites are pending until each teammate accepts — see teams.controller.js's
    // respondToTeamInvite. Fired after the insert succeeds, not inside the
    // atomic block above, since a failure here must never unwind registration.
    await Promise.all(
        invitedMembers.map((tm) => notifyTeamInvite({ student: tm.student, actor: student._id, teamMember: tm })),
    );

    await notifyEventRegistration({ community: event.community, actor: student._id, registration: registration._id });

    return res.status(201).json({ message: event.confirmationMessage || "Registered successfully", registration });
};

// "My Events" page — a student's registration history, newest first.
// Covers both registrations the student leads and ones where they were
// added as a TeamMember (that collection is where non-leader teammates
// actually live — Registration.student only ever holds the leader).
// Only *accepted* team memberships count as "mine" — a still-pending
// invite isn't a real commitment yet (see teams.controller.js's
// listMyTeamInvites for where those live instead).
module.exports.listMyRegistrations = async (req, res) => {
    const student = req.user;
    const { page, limit, status } = req.query;

    const memberRegistrationIds = await TeamMember.find({ student: student._id, status: "accepted" }).distinct("registration");

    const filter = { $or: [{ student: student._id }, { _id: { $in: memberRegistrationIds } }] };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [registrations, total] = await Promise.all([
        Registration.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: "event", select: "title eventDate venue community", populate: { path: "community", select: "name logo" } }),
        Registration.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, registrations, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// Organizer's registrant list for one event.
module.exports.listEventRegistrations = async (req, res) => {
    const community = req.user;
    const { eventId } = req.params;
    const { status, page, limit } = req.query;

    const event = await Event.findOne({ _id: eventId, community: community._id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const filter = { event: eventId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [registrations, total] = await Promise.all([
        Registration.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).populate("student", "name email profilePicture"),
        Registration.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, registrations, page, limit, total, totalPages: Math.ceil(total / limit) });
};

module.exports.getRegistration = async (req, res) => {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId).populate("event", "title eventDate venue community");
    if (!registration) return res.status(404).json({ message: "Registration not found" });
    // Dangling ref (event hard-deleted out from under this registration) —
    // registration.event.community below would otherwise throw a 500, the
    // same case cancelRegistration already guards.
    if (!registration.event) return res.status(404).json({ message: "Event not found" });

    const isLeader = req.role === "student" && registration.student.equals(req.user._id);
    const isOrganizer = req.role === "organizer" && registration.event.community.equals(req.user._id);
    const isTeamMember =
        req.role === "student" &&
        !isLeader &&
        (await TeamMember.exists({ registration: registration._id, student: req.user._id }));
    if (!isLeader && !isOrganizer && !isTeamMember) return res.status(403).json({ message: "Forbidden" });

    const teamMembers = await TeamMember.find({ registration: registration._id }).populate("student", "name email profilePicture");

    return res.status(200).json({ success: true, registration, teamMembers });
};

// Shared by the HTTP handler below and the student account-deletion cascade
// (students.controller.js) — `existing` must already be populated with
// `event`. Returns false if the registration was already cancelled (or
// raced to cancelled by a concurrent call) so callers can treat that as a
// no-op instead of a real cancellation.
const cancelRegistrationCore = async (existing, reason) => {
    const event = existing.event;

    // Atomic claim: the status:{$ne:"cancelled"} filter means only one of
    // several concurrent cancellations for this registration can actually
    // flip it — a plain findById+save() would let all of them read
    // "confirmed" before any wrote back, so every one would fall through to
    // wasConfirmed=true and each would promote its own waitlist entry for
    // what is really a single cancellation. `previous` is the pre-update
    // document, so its status tells us whether a slot needs freeing.
    const updateFields = { status: "cancelled", cancelledAt: new Date() };
    if (reason) updateFields.cancellationReason = reason;
    const previous = await Registration.findOneAndUpdate(
        { _id: existing._id, status: { $ne: "cancelled" } },
        { $set: updateFields },
    );
    if (!previous) return false;

    await TeamMember.deleteMany({ registration: existing._id });

    if (previous.status === "confirmed" && event) {
        // Atomic claim-and-select: findOneAndUpdate matches and updates a
        // single document in one step, so two cancellations racing each
        // other can never both pick the same oldest waitlisted registration
        // (a separate findOne-then-save would let both read it before either
        // wrote back, double-promoting one student and starving the next).
        const nextInLine = await Registration.findOneAndUpdate(
            { event: event._id, status: "waitlisted" },
            { $set: { status: "confirmed" } },
            { sort: { createdAt: 1 } },
        );

        if (nextInLine) {
            // Push the promoted registration's slot in BEFORE pulling the
            // cancelled one out, so confirmedRegistrationIds never dips below
            // capacity in between. Pulling first (the old releaseSlot-then-
            // promote order) opens a window where a concurrent
            // registerForEvent sees a free slot and snipes it ahead of the
            // waitlisted student who was actually first in line.
            await Event.updateOne({ _id: event._id }, { $push: { confirmedRegistrationIds: nextInLine._id } });
            await Event.updateOne({ _id: event._id }, { $pull: { confirmedRegistrationIds: existing._id } });

            await notifyWaitlistPromotion({ student: nextInLine.student, registration: nextInLine._id });
        } else {
            await releaseSlot(event._id, existing._id);
        }
    }

    return true;
};
module.exports.cancelRegistrationCore = cancelRegistrationCore;

module.exports.cancelRegistration = async (req, res) => {
    const { registrationId } = req.params;
    const { reason } = req.body;

    const existing = await Registration.findById(registrationId).populate("event");
    if (!existing || existing.status === "cancelled") {
        return res.status(404).json({ message: "Registration not found" });
    }
    if (!existing.event) {
        // Dangling ref (event hard-deleted out from under this registration) —
        // registration.event.community below would otherwise throw.
        return res.status(404).json({ message: "Event not found" });
    }

    if (req.role === "student") {
        if (!existing.student.equals(req.user._id)) {
            return res.status(403).json({ message: "You can only cancel your own registration" });
        }
    } else if (!existing.event.community.equals(req.user._id)) {
        return res.status(403).json({ message: "You can only cancel registrations for your own events" });
    }

    const cancelled = await cancelRegistrationCore(existing, reason);
    if (!cancelled) return res.status(404).json({ message: "Registration not found" });

    return res.status(200).json({ message: "Registration cancelled" });
};
