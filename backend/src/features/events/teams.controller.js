// Additional team members on a registration (models/TeamMember.js).
// The leader is Registration.student and is NOT duplicated here.
// {event, student} is uniquely indexed - one team per student per event.
// Check the roster size against Event.teamSize.min / max before confirming.
const TeamMember = require("../../models/TeamMember");
const Registration = require("../../models/Registration");
const Event = require("../../models/Event");
const { User } = require("../../models/User");
const buildAnswers = require("../../utils/buildAnswers");
const { isTeamQuestion } = require("../../models/FormQuestion.schema");
const { isRegistrationClosed } = require("../../utils/registrationWindow");
const { notifyTeamInvite, notifyTeamInviteResponse } = require("../../services/notification.service");

module.exports.listTeamMembers = async (req, res) => {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId).populate("event", "community");
    if (!registration) return res.status(404).json({ message: "Registration not found" });
    // Dangling ref (event hard-deleted out from under this registration) —
    // registration.event.community below would otherwise throw a 500.
    if (!registration.event) return res.status(404).json({ message: "Event not found" });

    const isLeader = req.role === "student" && registration.student.equals(req.user._id);
    const isOrganizer = req.role === "organizer" && registration.event.community.equals(req.user._id);
    const isTeamMember =
        req.role === "student" &&
        !isLeader &&
        (await TeamMember.exists({ registration: registrationId, student: req.user._id }));
    if (!isLeader && !isOrganizer && !isTeamMember) return res.status(403).json({ message: "Forbidden" });

    const members = await TeamMember.find({ registration: registrationId }).populate("student", "name email profilePicture");

    return res.status(200).json({ success: true, members });
};

module.exports.addTeamMember = async (req, res) => {
    const student = req.user;
    const { registrationId } = req.params;
    const { studentId, answers } = req.body;

    const registration = await Registration.findById(registrationId).populate("event");
    if (!registration || !registration.student.equals(student._id)) {
        return res.status(404).json({ message: "Registration not found" });
    }
    if (registration.status === "cancelled") {
        return res.status(400).json({ message: "This registration is cancelled" });
    }

    const event = registration.event;
    if (!event || !event.isActive) {
        return res.status(404).json({ message: "Event not found" });
    }

    if (isRegistrationClosed(event)) {
        return res.status(400).json({ message: "Registration deadline has passed" });
    }

    if (event.registrationType !== "team") {
        return res.status(400).json({ message: "This event does not support team registration" });
    }

    if (String(studentId) === String(student._id)) {
        return res.status(400).json({ message: "You are already the team leader" });
    }

    const currentSize = 1 + await TeamMember.countDocuments({ registration: registrationId });
    if (currentSize + 1 > event.teamSize.max) {
        return res.status(400).json({ message: `Team cannot exceed ${event.teamSize.max} members` });
    }

    const memberExists = await User.exists({ _id: studentId });
    if (!memberExists) return res.status(404).json({ message: "Student not found" });

    // TeamMember's {event, student} unique index only guards member-vs-member
    // duplicates - a student already leading (or waitlisted for) their own
    // Registration for this event isn't caught by that, so check explicitly.
    const alreadyRegistered = await Registration.exists({
        event: event._id,
        student: studentId,
        status: { $in: ["confirmed", "waitlisted"] },
    });
    if (alreadyRegistered) {
        return res.status(400).json({ message: "This student is already registered for this event" });
    }

    const memberQuestions = (event.formQuestions || []).filter((q) => !isTeamQuestion(q));
    const teamQuestions = (event.formQuestions || []).filter((q) => isTeamQuestion(q));

    const memberAnswers = buildAnswers(memberQuestions, answers);
    const parentRegistration = await Registration.findById(registrationId);
    const inheritedTeamAnswers = (parentRegistration?.answers || []).filter((a) =>
        teamQuestions.some((tq) => String(tq._id) === String(a.question))
    );

    let teamMember;
    try {
        teamMember = await TeamMember.create({
            registration: registrationId,
            event: event._id,
            student: studentId,
            answers: [...inheritedTeamAnswers, ...memberAnswers],
        });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: "This student is already on a team for this event" });
        if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
        throw err;
    }

    // The invite is pending until the student accepts — see respondToTeamInvite below.
    await notifyTeamInvite({ student: studentId, actor: student._id, teamMember });

    return res.status(201).json({ message: "Invite sent — pending the student's acceptance", teamMember });
};

module.exports.removeTeamMember = async (req, res) => {
    const student = req.user;
    const { registrationId, teamMemberId } = req.params;

    const registration = await Registration.findById(registrationId).populate("event");
    if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
    }
    if (registration.status === "cancelled") {
        return res.status(400).json({ message: "This registration is cancelled" });
    }

    const event = registration.event;
    if (!event || !event.isActive) {
        return res.status(404).json({ message: "Event not found" });
    }

    if (isRegistrationClosed(event)) {
        return res.status(400).json({ message: "Registration deadline has passed" });
    }

    const isLeader = registration.student.equals(student._id);

    const teamMember = await TeamMember.findOne({ _id: teamMemberId, registration: registrationId });
    if (!teamMember) return res.status(404).json({ message: "Team member not found" });

    const isSelf = teamMember.student.equals(student._id);
    if (!isLeader && !isSelf) {
        return res.status(403).json({ message: "Forbidden" });
    }

    if (teamMember.checkedIn) {
        return res.status(400).json({ message: "Cannot remove a team member who has already checked in" });
    }

    const currentSize = 1 + await TeamMember.countDocuments({ registration: registrationId });
    if (currentSize - 1 < event.teamSize.min) {
        return res.status(400).json({ message: `Team cannot go below ${event.teamSize.min} members` });
    }

    await TeamMember.deleteOne({ _id: teamMemberId });

    return res.status(200).json({ message: "Team member removed" });
};

// The invited student's own answer to a team invite — the mechanism this
// whole file was missing. Only the invited student may respond, and only
// once: a pending invite either becomes a real roster spot (accepted) or is
// removed outright (declined), freeing that {event, student} slot so the
// student can be invited to (or lead) a different team for the same event.
module.exports.respondToTeamInvite = async (req, res) => {
    const student = req.user;
    const { registrationId, teamMemberId } = req.params;
    const { action } = req.body;

    const teamMember = await TeamMember.findOne({ _id: teamMemberId, registration: registrationId }).populate("registration");
    if (!teamMember || !teamMember.student.equals(student._id)) {
        return res.status(404).json({ message: "Invite not found" });
    }

    const registration = teamMember.registration;
    if (!registration || registration.status === "cancelled") {
        return res.status(404).json({ message: "Registration not found" });
    }

    if (teamMember.status !== "pending") {
        return res.status(400).json({ message: `This invite was already ${teamMember.status}` });
    }

    if (action === "accept") {
        const event = await Event.findById(registration.event);
        if (!event || !event.isActive) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (isRegistrationClosed(event)) {
            return res.status(400).json({ message: "Registration deadline has passed" });
        }

        teamMember.status = "accepted";
        teamMember.respondedAt = new Date();
        await teamMember.save();

        await notifyTeamInviteResponse({ student: registration.student, actor: student._id, registration: registration._id, accepted: true });

        return res.status(200).json({ message: "Invite accepted", teamMember });
    }

    // decline
    await TeamMember.deleteOne({ _id: teamMemberId });
    await notifyTeamInviteResponse({ student: registration.student, actor: student._id, registration: registration._id, accepted: false });

    return res.status(200).json({ message: "Invite declined" });
};

// A student's pending team invites across all events — what the new "Team
// Invites" panel on My Events reads. Only pending ones: once acted on, an
// invite is either a real roster spot (visible via listMyRegistrations) or
// gone (declined).
module.exports.listMyTeamInvites = async (req, res) => {
    const student = req.user;

    const invites = await TeamMember.find({ student: student._id, status: "pending" })
        .sort({ createdAt: -1 })
        .populate({ path: "event", select: "title eventDate venue community", populate: { path: "community", select: "name logo" } })
        .populate({ path: "registration", select: "teamName student", populate: { path: "student", select: "name email profilePicture" } });

    return res.status(200).json({ success: true, invites });
};
