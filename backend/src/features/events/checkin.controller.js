// QR attendance marking, organizer-only.
// Both Registration.qrToken (leader) and TeamMember.qrToken (members) are
// scannable, so a scan resolves against both collections.
// Keep it idempotent: a second scan reports "already checked in" instead of
// overwriting checkedInAt.
const Event = require("../../models/Event");
const Registration = require("../../models/Registration");
const TeamMember = require("../../models/TeamMember");

module.exports.checkIn = async (req, res) => {
    const community = req.user;
    const { eventId } = req.params;
    const { qrToken } = req.body;

    const event = await Event.findOne({ _id: eventId, community: community._id, isActive: true });
    if (!event) return res.status(404).json({ message: "Event not found" });

    let record = await Registration.findOne({ event: eventId, qrToken });
    let kind = "leader";

    if (!record) {
        record = await TeamMember.findOne({ event: eventId, qrToken }).populate("registration", "status paymentStatus");
        kind = "member";
    }

    if (!record) return res.status(404).json({ message: "Invalid QR token for this event" });
    if (kind === "member" && !record.registration) {
        // Orphaned TeamMember — its parent Registration was removed out from
        // under it (e.g. a cancelled registration whose TeamMember cleanup
        // raced this scan). record.registration.status below would otherwise throw.
        return res.status(404).json({ message: "Registration not found for this team member" });
    }
    // A member who hasn't accepted their invite yet isn't really part of the
    // roster — scanning their QR (e.g. still printed on a shared team sheet)
    // shouldn't check in someone who never confirmed they're attending.
    if (kind === "member" && record.status !== "accepted") {
        return res.status(400).json({ message: `This team member hasn't accepted their invite yet (${record.status})` });
    }

    // A team member's own record has no status/paymentStatus of its own — it
    // rides on the leader's Registration fields, so a still-waitlisted or
    // unpaid team can't check in through a member's QR just because the
    // leader-only gate was bypassed.
    const registrationStatus = kind === "leader" ? record.status : record.registration.status;
    if (registrationStatus !== "confirmed") {
        return res.status(400).json({ message: `Registration is ${registrationStatus}, not confirmed` });
    }

    // For paid events, paymentStatus starts "pending" and only becomes "paid"
    // once payment is confirmed server-side — "confirmed" registrationStatus
    // alone doesn't mean the ticket was paid for.
    const paymentStatus = kind === "leader" ? record.paymentStatus : record.registration.paymentStatus;
    if (paymentStatus !== "not_required" && paymentStatus !== "paid") {
        return res.status(400).json({ message: `Payment is ${paymentStatus} — cannot check in until payment is confirmed` });
    }

    if (record.checkedIn) {
        return res.status(200).json({
            message: "Already checked in",
            alreadyCheckedIn: true,
            checkedInAt: record.checkedInAt,
        });
    }

    record.checkedIn = true;
    record.checkedInAt = new Date();
    await record.save();

    return res.status(200).json({ message: "Checked in", kind, record });
};
