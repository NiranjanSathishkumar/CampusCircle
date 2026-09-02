// Community roster (models/CommunityMembership.js).
// Organizer: add / relabel / remove members. label is free text and carries no
// permissions. Removal is a soft delete (isActive: false) so history survives
// and a member can be re-added later.
const CommunityMembership = require("../../models/CommunityMembership");
const { User } = require("../../models/User");
const Community = require("../../models/Community");
const { notifyRolePromotion } = require("../../services/notification.service");

// Membership documents whose community was deleted or deactivated are
// filtered out of the returned list, so total/totalPages must exclude
// them too — mirrors follows.controller.js's countActiveFollowsWithExistingTarget.
async function countActiveMembershipsWithActiveCommunity(filter) {
    const rows = await CommunityMembership.aggregate([
        { $match: filter },
        { $lookup: { from: Community.collection.name, localField: "community", foreignField: "_id", as: "c" } },
        { $match: { $expr: { $eq: [{ $arrayElemAt: ["$c.isActive", 0] }, true] } } },
        { $count: "count" },
    ]);
    return rows[0]?.count ?? 0;
}

// Organizer's roster view for their own community.
module.exports.listRoster = async (req, res) => {
    const community = req.user;
    const { page, limit } = req.query;

    const filter = { community: community._id, isActive: true };
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
        CommunityMembership.find(filter).sort({ joinedAt: -1 }).skip(skip).limit(limit).populate("student", "name email profilePicture"),
        CommunityMembership.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, members, page, limit, total, totalPages: Math.ceil(total / limit) });
};

module.exports.addMember = async (req, res) => {
    const community = req.user;
    const { studentId, label } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.isSuspended) return res.status(404).json({ message: "Student not found" });

    let membership = await CommunityMembership.findOne({ community: community._id, student: studentId }).sort({ isActive: -1 });

    if (membership?.isActive) {
        return res.status(400).json({ message: "This student is already a member" });
    }

    if (membership) {
        membership.isActive = true;
        membership.joinedAt = new Date();
        membership.label = label || "Member";
    } else {
        membership = new CommunityMembership({ community: community._id, student: studentId, label });
    }

    try {
        await membership.save();
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: "This student is already a member" });
        if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
        throw err;
    }

    await notifyRolePromotion({ student: studentId, membership: membership._id });

    return res.status(201).json({ message: "Member added", membership });
};


module.exports.updateMemberLabel = async (req, res) => {
    const community = req.user;
    const { membershipId } = req.params;
    const { label } = req.body;

    const membership = await CommunityMembership.findOne({ _id: membershipId, community: community._id, isActive: true });
    if (!membership) return res.status(404).json({ message: "Member not found" });

    const labelChanged = membership.label !== label;
    membership.label = label;

    try {
        await membership.save();
    } catch (err) {
        if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
        throw err;
    }

    if (labelChanged) {
        await notifyRolePromotion({ student: membership.student, membership: membership._id });
    }

    return res.status(200).json({ message: "Member relabeled", membership });
};

module.exports.removeMember = async (req, res) => {
    const community = req.user;
    const { membershipId } = req.params;

    const membership = await CommunityMembership.findOne({ _id: membershipId, community: community._id, isActive: true });
    if (!membership) return res.status(404).json({ message: "Member not found" });

    membership.isActive = false;
    await membership.save();

    return res.status(200).json({ message: "Member removed" });
};

// A student's own membership list across every community they belong to.
module.exports.listMyMemberships = async (req, res) => {
    const student = req.user;
    const { page, limit } = req.query;

    const filter = { student: student._id, isActive: true };
    const skip = (page - 1) * limit;
    const [rawMemberships, total] = await Promise.all([
        CommunityMembership.find(filter)
            .sort({ joinedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: "community", select: "name logo", match: { isActive: true } }),
        countActiveMembershipsWithActiveCommunity(filter),
    ]);

    const memberships = rawMemberships.filter((m) => m.community != null);

    return res.status(200).json({ success: true, memberships, page, limit, total, totalPages: Math.ceil(total / limit) });
};
