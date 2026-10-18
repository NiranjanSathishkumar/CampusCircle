// Follow graph (models/Follow.js) - polymorphic: a student follows either a
// User or a Community, discriminated by followingType.
// Follow / unfollow, list following, list followers.
// followerCount and followingCount are kept in sync by explicitly calling
// applyCountChange() after every follow/unfollow/reactivate transition
// below (it also runs from the model's cascade-delete hooks); self-follow
// is already blocked at the schema level.
const Follow = require("../../models/Follow");
const { applyCountChange } = Follow;
const { User } = require("../../models/User");
const Community = require("../../models/Community");
const { notifyNewFollower } = require("../../services/notification.service");

const FOLLOWABLE_MODELS = { User, Community };

module.exports.followTarget = async (req, res) => {
    const follower = req.user;
    const { followingType, followingId } = req.body;

    if (followingType === "User" && followingId === String(follower._id)) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const target = await FOLLOWABLE_MODELS[followingType].findById(followingId);
    if (
        !target ||
        (followingType === "Community" && target.isActive === false) ||
        (followingType === "User" && target.isSuspended === true)
    ) {
        return res.status(404).json({ message: `${followingType} not found` });
    }

    // Re-following reactivates the old (soft-deleted) doc instead of creating
    // a new one, so createdAt stays the original follow date.
    let follow = await Follow.findOne({ follower: follower._id, following: followingId, followingType });

    if (follow?.isActive) {
        return res.status(400).json({ message: "Already following" });
    }

    if (follow) {
        // Atomic reactivation to prevent concurrent double-increment
        const reactivated = await Follow.findOneAndUpdate(
            { _id: follow._id, isActive: false },
            { $set: { isActive: true, unfollowedAt: null } },
            { returnDocument: "after" }
        );
        if (!reactivated) {
            return res.status(400).json({ message: "Already following" });
        }
        await applyCountChange(reactivated, 1);
        follow = reactivated;
    } else {
        follow = new Follow({ follower: follower._id, following: followingId, followingType, isActive: true });
        try {
            await follow.save();
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ message: "Already following" });
            }
            throw err;
        }
        await applyCountChange(follow, 1);
    }

    if (followingType === "User") {
        await notifyNewFollower({ follower: follower._id, followedUser: followingId });
    }

    return res.status(201).json({ success: true, message: "Followed successfully", follow });
};

module.exports.unfollowTarget = async (req, res) => {
    const follower = req.user;
    const { followingType, followingId } = req.params;

    // Atomic deactivation to prevent concurrent double-decrement
    const follow = await Follow.findOneAndUpdate(
        {
            follower: follower._id,
            following: followingId,
            followingType,
            isActive: true,
        },
        {
            $set: {
                isActive: false,
                unfollowedAt: new Date(),
            },
        },
        { returnDocument: "after" }
    );

    if (!follow) {
        return res.status(404).json({ message: "You are not following this " + followingType.toLowerCase() });
    }

    await applyCountChange(follow, -1);

    return res.status(200).json({ success: true, message: "Unfollowed successfully" });
};

module.exports.listFollowing = async (req, res) => {
    const follower = req.user;
    const { followingType, page, limit } = req.query;

    const filter = { follower: follower._id, isActive: true };
    if (followingType) filter.followingType = followingType;

    const skip = (page - 1) * limit;
    const [rawFollows, total] = await Promise.all([
        Follow.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "following",
                select: "name profilePicture profileBanner logo banner category tagline description branch yearOfJoining bio followerCount followingCount isVerified isRecruiting",
            }),
        Follow.countDocuments(filter),
    ]);

    const following = rawFollows.filter((f) => f.following != null);

    return res.status(200).json({
        success: true,
        following,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
};

module.exports.listFollowers = async (req, res) => {
    const { followingType, followingId } = req.params;
    const { page, limit } = req.query;

    const targetFilter = { _id: followingId };
    if (followingType === "Community") targetFilter.isActive = true;
    if (followingType === "User") targetFilter.isSuspended = { $ne: true };
    const targetExists = await FOLLOWABLE_MODELS[followingType].exists(targetFilter);
    if (!targetExists) {
        return res.status(404).json({ message: `${followingType} not found` });
    }

    const filter = { following: followingId, followingType, isActive: true };

    const skip = (page - 1) * limit;
    const [rawFollows, total] = await Promise.all([
        Follow.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("follower", "name profilePicture profileBanner branch yearOfJoining bio followerCount followingCount isProfileComplete"),
        Follow.countDocuments(filter),
    ]);

    const followers = rawFollows.filter((f) => f.follower != null);

    return res.status(200).json({
        success: true,
        followers,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
};
