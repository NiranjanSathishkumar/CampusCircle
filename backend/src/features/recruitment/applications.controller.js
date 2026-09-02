// Applications to a drive (models/CommunityApplication.js).
// Student: submit (one per drive, uniquely indexed) and list own history.
// Organizer: review queue, set status pending | selected | rejected.
// NOTE: selecting an applicant must also create a CommunityMembership using the
// drive's title as its label - the schema does not enforce this.
const CommunityApplication = require("../../models/CommunityApplication");
const CommunityRecruitment = require("../../models/CommunityRecruitment");
const CommunityMembership = require("../../models/CommunityMembership");
const { notifyRolePromotion, notifyRecruitmentApplication } = require("../../services/notification.service");
const buildAnswers = require("../../utils/buildAnswers");
const buildProfileSnapshot = require("../../utils/buildProfileSnapshot");

module.exports.submitApplication = async (req, res) => {
    const student = req.user;
    const { recruitmentId } = req.params;

    const drive = await CommunityRecruitment.findById(recruitmentId);
    if (!drive) return res.status(404).json({ message: "Recruitment drive not found" });

    if (!drive.isAcceptingApplications) {
        return res.status(400).json({ message: "This recruitment drive is not accepting applications" });
    }

    // When the drive wants profile data alongside the custom questions, the
    // relevant fields must actually be filled in, and get snapshotted onto
    // the application (not just read) so the record stays accurate even if
    // the student edits their profile afterward.
    const profileSnapshot = drive.collectProfileData ? buildProfileSnapshot(student, "applying") : undefined;

    const answers = buildAnswers(drive.formQuestions, req.body.answers);

    const application = new CommunityApplication({
        recruitment: drive._id,
        student: student._id,
        answers,
        profileSnapshot,
    });

    try {
        await application.save();
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: "You have already applied to this drive" });
        if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
        throw err;
    }

    await notifyRecruitmentApplication({ community: drive.community, actor: student._id, application: application._id });

    return res.status(201).json({ message: drive.confirmationMessage || "Application submitted", application });
};

// "My Applications" page — a student's history across every community, newest first.
module.exports.listMyApplications = async (req, res) => {
    const student = req.user;
    const { page, limit } = req.query;

    const filter = { student: student._id };
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
        CommunityApplication.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: "recruitment", select: "title community", populate: { path: "community", select: "name logo" } }),
        CommunityApplication.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, applications, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// Organizer's review queue for one drive, oldest first.
module.exports.listDriveApplications = async (req, res) => {
    const community = req.user;
    const { recruitmentId } = req.params;
    const { status, page, limit } = req.query;

    const drive = await CommunityRecruitment.findOne({ _id: recruitmentId, community: community._id });
    if (!drive) return res.status(404).json({ message: "Recruitment drive not found" });

    const filter = { recruitment: recruitmentId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
        CommunityApplication.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).populate("student", "name email profilePicture"),
        CommunityApplication.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, applications, page, limit, total, totalPages: Math.ceil(total / limit) });
};

module.exports.updateApplicationStatus = async (req, res) => {
    const community = req.user;
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await CommunityApplication.findById(applicationId).populate("recruitment");
    if (!application || !application.recruitment || !application.recruitment.community.equals(community._id)) {
        return res.status(404).json({ message: "Application not found" });
    }

    const previousStatus = application.status;
    // No-op re-submission (e.g. a double-click before the review button
    // disables, or a retried request) — skip straight to responding instead
    // of re-running the membership side effects below, which would re-save
    // an unchanged membership and fire a duplicate notification for it.
    if (previousStatus === status) {
        return res.status(200).json({ message: "Application status unchanged", application });
    }

    application.status = status;
    await application.save();

    // Selecting an applicant creates (or reactivates) their CommunityMembership,
    // labeled with the drive's title — mirrors the reactivate-soft-deleted-doc
    // pattern used for Follow/Like so re-selecting a former member is safe.
    let membership;
    if (status === "selected") {
        // A student can accumulate multiple soft-deleted (isActive: false) memberships
        // alongside at most one active one — prefer the active record when one exists.
        membership = await CommunityMembership.findOne({ community: community._id, student: application.student }).sort({ isActive: -1 });

        if (membership) {
            if (!membership.isActive) {
                membership.isActive = true;
                membership.joinedAt = new Date();
            }
            membership.label = application.recruitment.title;
            membership.application = application._id;
        } else {
            membership = new CommunityMembership({
                community: community._id,
                student: application.student,
                label: application.recruitment.title,
                application: application._id,
            });
        }

        try {
            await membership.save();
        } catch (err) {
            if (err.code !== 11000) throw err;
            membership = await CommunityMembership.findOne({ community: community._id, student: application.student, isActive: true });
            membership.label = application.recruitment.title;
            membership.application = application._id;
            await membership.save();
        }

        await notifyRolePromotion({ student: application.student, membership: membership._id });
    } else if (previousStatus === "selected") {
        // Reverting a prior selection — deactivate the membership that was
        // created/reactivated as a side effect, so the roster doesn't retain
        // an active member whose selection was undone.
        membership = await CommunityMembership.findOne({ application: application._id, isActive: true });
        if (membership) {
            membership.isActive = false;
            await membership.save();
        }
    }

    return res.status(200).json({ message: "Application status updated", application, membership });
};
