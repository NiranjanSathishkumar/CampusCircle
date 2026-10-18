// Sweeps expired slot reservations (paid events where student did not
// complete payment/upload proof within the reservation timeout).
// Frees the slot atomically and promotes the next waitlisted student.
const Registration = require("../models/Registration");
const { cancelRegistrationCore } = require("../features/events/registrations.controller");

const SWEEP_INTERVAL_MS = 2 * 60 * 1000; // sweep every 2 minutes

const sweepExpiredSlots = async () => {
    try {
        const expiredRegistrations = await Registration.find({
            status: "reserved",
            paymentStatus: { $in: ["pending", "rejected"] },
            slotExpiresAt: { $lte: new Date() },
        }).populate("event");

        for (const reg of expiredRegistrations) {
            try {
                await cancelRegistrationCore(reg, "Slot reservation expired due to incomplete payment");
            } catch (err) {
                console.error(`Failed to cancel expired registration ${reg._id}:`, err);
            }
        }
    } catch (err) {
        console.error("Auto-expire reserved slots sweep failed:", err);
    }
};

const startExpireReservedSlotsJob = () => {
    sweepExpiredSlots();
    setInterval(sweepExpiredSlots, SWEEP_INTERVAL_MS);
};

module.exports = { startExpireReservedSlotsJob, sweepExpiredSlots };
