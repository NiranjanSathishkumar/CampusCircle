// Recruitment drives (models/CommunityRecruitment.js), organizer-owned.
// Create / update / close a drive and its formQuestions.
// isOpen gates new applications; the isAcceptingApplications virtual also
// accounts for deadline, so check that rather than isOpen alone.
const CommunityRecruitment = require("../../models/CommunityRecruitment");
const CommunityApplication = require("../../models/CommunityApplication");
const Community = require("../../models/Community");
const { notifyCommunityRecruitment } = require("../../services/notification.service");

module.exports.createDrive = async (req, res) => {
    const community = req.user;

    const drive = new CommunityRecruitment({ community: community._id, ...req.body });

    try {
        await drive.save();
    } catch (err) {
        if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
        throw err;
    }

    if (drive.isOpen) {
        await notifyCommunityRecruitment({ community: community._id, recruitment: drive._id });
    }

    return res.status(201).json({ message: "Recruitment drive created", drive });
};

// Also handles closing/reopening via isOpen, and replaces formQuestions
// wholesale when provided — old CommunityApplication.answers stay
// interpretable regardless since they snapshot label/type at submission time.
module.exports.updateDrive = async (req, res) => {
    const community = req.user;
    const { recruitmentId } = req.params;

    const drive = await CommunityRecruitment.findOne({ _id: recruitmentId, community: community._id });
    if (!drive) return res.status(404).json({ message: "Recruitment drive not found" });

    const wasOpen = drive.isOpen;

    Object.assign(drive, req.body);

    try {
        await drive.save();
    } catch (err) {
        if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
        throw err;
    }

    if (!wasOpen && drive.isOpen) {
        await notifyCommunityRecruitment({ community: community._id, recruitment: drive._id });
    }

    return res.status(200).json({ message: "Recruitment drive updated", drive });
};

// Soft-delete (isActive: false), mirroring events.controller.js's deleteEvent —
// applications belong to this drive and must not be orphaned by a hard delete.
module.exports.deleteDrive = async (req, res) => {
    const community = req.user;
    const { recruitmentId } = req.params;

    const drive = await CommunityRecruitment.findOne({ _id: recruitmentId, community: community._id });
    if (!drive) return res.status(404).json({ message: "Recruitment drive not found" });

    drive.isActive = false;
    await drive.save();

    return res.status(200).json({ message: "Recruitment drive removed" });
};

module.exports.getDrive = async (req, res) => {
    const { recruitmentId } = req.params;

    const drive = await CommunityRecruitment.findById(recruitmentId).populate("community", "name logo");
    if (!drive) return res.status(404).json({ message: "Recruitment drive not found" });

    const isOwner = req.role === "organizer" && req.user._id.equals(drive.community._id);
    if (!drive.isActive && !isOwner) {
        return res.status(404).json({ message: "Recruitment drive not found" });
    }

    return res.status(200).json({ success: true, drive });
};

// A community's own drives, most recent first — surfaces on CommunityDetailPage.
// The owning organizer sees everything; everyone else sees only open drives
// unless they explicitly filter (?isOpen=false) for the closed ones.
module.exports.listCommunityDrives = async (req, res) => {
    const { communityId } = req.params;
    const { isOpen, page, limit } = req.query;

    const communityExists = await Community.exists({ _id: communityId });
    if (!communityExists) return res.status(404).json({ message: "Community not found" });

    const filter = { community: communityId };
    const isOwner = req.role === "organizer" && req.user._id.equals(communityId);

    if (!isOwner) filter.isActive = true;

    if (isOpen !== undefined) {
        filter.isOpen = isOpen;
    } else if (!isOwner) {
        filter.isOpen = true;
    }

    const skip = (page - 1) * limit;
    const [driveDocs, total] = await Promise.all([
        CommunityRecruitment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        CommunityRecruitment.countDocuments(filter),
    ]);

    // The owner's drives list shows an applicant count per drive — computed here
    // in one aggregate rather than leaving the caller to fetch it per drive
    // (that N+1 pattern is what OrganizerRecruitmentPage used to do client-side).
    let drives = driveDocs;
    if (isOwner && driveDocs.length) {
        const counts = await CommunityApplication.aggregate([
            { $match: { recruitment: { $in: driveDocs.map((d) => d._id) } } },
            { $group: { _id: "$recruitment", total: { $sum: 1 } } },
        ]);
        const countByDrive = new Map(counts.map((c) => [String(c._id), c.total]));
        drives = driveDocs.map((d) => ({ ...d.toJSON(), applicationsCount: countByDrive.get(String(d._id)) || 0 }));
    }

    return res.status(200).json({ success: true, drives, page, limit, total, totalPages: Math.ceil(total / limit) });
};
