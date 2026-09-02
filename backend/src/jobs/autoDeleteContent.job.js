// Sweeps content past its community-set auto-delete timeline (expiresAt on
// Post/Event/CommunityRecruitment).
//
// Posts are hard-deleted with full cascade cleanup (attachments, comments,
// likes, notifications) via the same helper the manual delete endpoint uses.
// Events and recruitment drives are soft-deleted (isActive: false) instead —
// the same effect their manual delete endpoints have — since registrations,
// team members, payments, check-ins, and applications reference them and
// must not be orphaned by a hard delete.
const Post = require("../models/Post");
const Event = require("../models/Event");
const CommunityRecruitment = require("../models/CommunityRecruitment");
const { deletePostCascade } = require("../features/feed/posts.controller");

const SWEEP_INTERVAL_MS = 60 * 60 * 1000; // hourly

const sweepExpiredPosts = async () => {
    const expiredPosts = await Post.find({ expiresAt: { $lte: new Date() } });

    for (const post of expiredPosts) {
        try {
            await deletePostCascade(post);
        } catch (err) {
            console.error(`Auto-delete failed for post ${post._id}:`, err);
        }
    }
};

const sweepExpiredEvents = async () => {
    await Event.updateMany(
        { expiresAt: { $lte: new Date() }, isActive: true },
        { $set: { isActive: false } },
    );
};

const sweepExpiredRecruitmentDrives = async () => {
    await CommunityRecruitment.updateMany(
        { expiresAt: { $lte: new Date() }, isActive: true },
        { $set: { isActive: false } },
    );
};

const sweepExpiredContent = async () => {
    await Promise.all([
        sweepExpiredPosts().catch((err) => console.error("Auto-delete posts sweep failed:", err)),
        sweepExpiredEvents().catch((err) => console.error("Auto-delete events sweep failed:", err)),
        sweepExpiredRecruitmentDrives().catch((err) => console.error("Auto-delete recruitment drives sweep failed:", err)),
    ]);
};

const startAutoDeleteContentJob = () => {
    sweepExpiredContent();
    setInterval(sweepExpiredContent, SWEEP_INTERVAL_MS);
};

module.exports = { startAutoDeleteContentJob, sweepExpiredContent };
