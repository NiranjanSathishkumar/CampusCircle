const { User, DEFAULT_PROFILE_BANNER, DEFAULT_PROFILE_PICTURE } = require("../../models/User");
const Achievement = require("../../models/Achievement");
const Registration = require("../../models/Registration");
const TeamMember = require("../../models/TeamMember");
const Bookmark = require("../../models/Bookmark");
const Like = require("../../models/Like");
const Comment = require("../../models/Comment");
const Follow = require("../../models/Follow");
const CommunityMembership = require("../../models/CommunityMembership");
const CommunityApplication = require("../../models/CommunityApplication");
const Community = require("../../models/Community");
const Notification = require("../../models/Notification");
const { cancelRegistrationCore } = require("../events/registrations.controller");
const { deleteEverywhere } = require("../../utils/fileStorage");
const { reserveEmail, releaseEmail } = require("../../utils/ensureEmailUnique");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PUBLIC_STUDENT_SELECT =
    "name branch yearOfJoining bio skills education interestTags socialLinks profilePicture profileBanner followerCount followingCount createdAt isProfileComplete";

/* ---------------------------------- Profile --------------------------------- */

module.exports.getUserProfile = async (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
};

module.exports.lookupStudentProfile = async (req, res) => {
    const { email, studentId } = req.query;

    let student = null;
    if (email) {
        student = await User.findOne({ email: email.toLowerCase().trim() }).select(
            "name email branch yearOfJoining bio skills education interestTags socialLinks profilePicture profileBanner followerCount followingCount createdAt"
        );
    } else if (studentId) {
        student = await User.findById(studentId).select(
            "name email branch yearOfJoining bio skills education interestTags socialLinks profilePicture profileBanner followerCount followingCount createdAt"
        );
    }

    if (!student) {
        return res.status(404).json({
            message: email ? `No registered student found with email "${email}"` : "No student account found with that id",
        });
    }

    return res.status(200).json({
        success: true,
        student,
        user: student,
    });
};

module.exports.listBuddies = async (req, res) => {
    const { search, branch, year, skill, page = 1, limit = 30, excludeSelf } = req.query;

    const filter = { isSuspended: { $ne: true } };

    if (excludeSelf && req.user?._id) {
        filter._id = { $ne: req.user._id };
    }

    if (branch && branch !== "All Branches" && branch !== "All") {
        filter.branch = branch;
    }

    if (year && year !== "All Years" && year !== "All") {
        const cutover = User.getAcademicCutoverYear();
        const yearNormalized = String(year).toLowerCase().trim();
        if (yearNormalized.includes("1") || yearNormalized.includes("fe") || yearNormalized.includes("first")) {
            filter.yearOfJoining = cutover;
        } else if (yearNormalized.includes("2") || yearNormalized.includes("se") || yearNormalized.includes("second")) {
            filter.yearOfJoining = cutover - 1;
        } else if (yearNormalized.includes("3") || yearNormalized.includes("te") || yearNormalized.includes("third")) {
            filter.yearOfJoining = cutover - 2;
        } else if (yearNormalized.includes("4") || yearNormalized.includes("be") || yearNormalized.includes("final") || yearNormalized.includes("fourth")) {
            filter.yearOfJoining = cutover - 3;
        } else if (yearNormalized.includes("grad") || yearNormalized.includes("alumn")) {
            filter.yearOfJoining = { $lt: cutover - 3 };
        } else if (!isNaN(Number(year))) {
            const yrNum = Number(year);
            if (yrNum >= 1 && yrNum <= 4) {
                filter.yearOfJoining = cutover - yrNum + 1;
            } else if (yrNum >= 2015) {
                filter.yearOfJoining = yrNum;
            }
        }
    }

    if (skill && skill !== "All") {
        const skillRegex = new RegExp(`^${escapeRegex(skill.trim())}$`, "i");
        filter.skills = skillRegex;
    }

    if (search && search.trim()) {
        const regex = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [
            { name: regex },
            { bio: regex },
            { skills: regex },
            { interestTags: regex },
        ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 30));
    const skip = (pageNum - 1) * limitNum;

    const [rawBuddies, total] = await Promise.all([
        User.find(filter)
            .select(PUBLIC_STUDENT_SELECT)
            .sort({ followerCount: -1, name: 1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        User.countDocuments(filter),
    ]);

    let followedSet = new Set();
    if (req.user?._id) {
        const buddyIds = rawBuddies.map((b) => b._id);
        const myFollows = await Follow.find({
            follower: req.user._id,
            following: { $in: buddyIds },
            followingType: "User",
            isActive: true,
        }).distinct("following");
        followedSet = new Set(myFollows.map((id) => id.toString()));
    }

    const buddies = rawBuddies.map((b) => ({
        ...b,
        isFollowedByMe: followedSet.has(b._id.toString()),
    }));

    return res.status(200).json({
        success: true,
        buddies,
        students: buddies,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
    });
};

module.exports.getStudentPublicProfile = async (req, res) => {
    const { studentId } = req.params;

    // Explicit allow-list (not a blocklist) so private identifiers — email, rollNo,
    // prnNo, moderation flags, auth secrets — stay excluded even if new sensitive
    // fields get added to the User schema later.
    const student = await User.findById(studentId).select(
        "name branch yearOfJoining bio skills education interestTags socialLinks profilePicture profileBanner followerCount followingCount createdAt isProfileComplete isSuspended"
    );

    if (!student || student.isSuspended) {
        return res.status(404).json({
            message: "Student not found",
        });
    }

    let isFollowedByMe = false;
    if (req.user && req.role === "student" && String(req.user._id) !== String(student._id)) {
        const followExists = await Follow.exists({
            follower: req.user._id,
            following: student._id,
            followingType: "User",
            isActive: true,
        });
        isFollowedByMe = Boolean(followExists);
    }

    const [achievements, memberships] = await Promise.all([
        Achievement.find({ student: student._id }).sort({ createdAt: -1 }),
        CommunityMembership.find({ student: student._id, isActive: true })
            .populate("community", "name logo category banner")
            .sort({ joinedAt: -1 }),
    ]);

    const communities = memberships
        .filter((m) => m.community != null)
        .map((m) => ({
            id: m.community._id,
            name: m.community.name,
            role: m.label || "Member",
            logo: m.community.logo,
            category: m.community.category,
        }));

    return res.status(200).json({
        success: true,
        student,
        user: student,
        achievements,
        communities,
        isFollowedByMe,
    });
};

module.exports.updateUserProfile = async (req, res) => {
    const user = req.user;
    // validate(schema.updateProfile) has already dropped unknown keys and applied
    // the trim/lowercase/uppercase rules, so this is exactly the updatable set.
    const updatedUserData = req.body;

    // Snapshot before any mutation to user — including the sparse-field unset
    // handling right below — so a failed save or conflict can be rolled back
    // to the exact state we started from, not a state that already lost
    // rollNo/prnNo.
    const previousUserState = user.toObject({ virtuals: false });

    // Handle sparse unique fields (rollNo and prnNo): empty string or null means unset
    if ("rollNo" in updatedUserData) {
        if (!updatedUserData.rollNo) {
            user.rollNo = undefined;
            delete updatedUserData.rollNo;
        }
    }
    if ("prnNo" in updatedUserData) {
        if (!updatedUserData.prnNo) {
            user.prnNo = undefined;
            delete updatedUserData.prnNo;
        }
    }

    // Check for unique field conflicts across other users in a single database query ($ne current user)
    const conflictConditions = [];
    const emailNormalized = updatedUserData.email ?? null;
    const rollNoNormalized = updatedUserData.rollNo ?? null;
    const prnNoNormalized = updatedUserData.prnNo ?? null;

    const oldEmail = user.email;
    const isEmailChanged = Boolean(emailNormalized && emailNormalized !== oldEmail);

    if (isEmailChanged) {
        // Atomically reserve the new email in EmailRegistry across all roles.
        // This alone guarantees uniqueness, so email never needs to also go
        // through the rollNo/prnNo conflict query below.
        const reserved = await reserveEmail(emailNormalized, "student");
        if (!reserved) {
            return res.status(400).json({
                message: "Email already in use by another user"
            });
        }
    }

    if (rollNoNormalized && rollNoNormalized !== user.rollNo) {
        conflictConditions.push({ field: "rollNo", condition: { rollNo: rollNoNormalized } });
    }
    if (prnNoNormalized && prnNoNormalized !== user.prnNo) {
        conflictConditions.push({ field: "prnNo", condition: { prnNo: prnNoNormalized } });
    }

    if (conflictConditions.length > 0) {
        let existingUsers;
        try {
            existingUsers = await User.find({
                _id: { $ne: user._id },
                $or: conflictConditions.map(c => c.condition)
            });
        } catch (err) {
            if (isEmailChanged) {
                await releaseEmail(emailNormalized);
            }
            throw err;
        }

        const fieldLabels = { rollNo: "Roll Number", prnNo: "PRN Number" };
        const conflictingFields = new Set();

        for (const existingUser of existingUsers) {
            for (const { field } of conflictConditions) {
                if (field === "rollNo" && existingUser.rollNo === rollNoNormalized) conflictingFields.add(field);
                if (field === "prnNo" && existingUser.prnNo === prnNoNormalized) conflictingFields.add(field);
            }
        }

        if (conflictingFields.size > 0) {
            if (isEmailChanged) {
                await releaseEmail(emailNormalized);
            }
            const labels = [...conflictingFields].map(f => fieldLabels[f]);
            return res.status(400).json({
                message: `${labels.join(", ")} already in use by another user`
            });
        }
    }

    Object.assign(user, updatedUserData);

    try {
        await user.save();
    } catch (err) {
        user.set(previousUserState);
        if (isEmailChanged) {
            await releaseEmail(emailNormalized);
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email, Roll Number, or PRN Number already in use by another user" });
        }
        throw err;
    }

    if (isEmailChanged) {
        // Best-effort cleanup: the profile update already committed, so a failure
        // releasing the old email reservation shouldn't turn a successful request
        // into an error response. Worst case, the old email stays locked in
        // EmailRegistry until it's cleared out manually.
        try {
            await releaseEmail(oldEmail);
        } catch (err) {
            console.error("Failed to release old email reservation:", err);
        }
    }

    return res.status(200).json({
        success: true,
        message: "User Profile Updated Successfully",
        user
    });
};

/* ---------------------------------- Media ----------------------------------- */

module.exports.uploadProfilePicture = async (req, res) => {
    const user = req.user;

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    // Snapshot as a plain object, not a reference to the live subdocument:
    // assigning user.profilePicture below mutates that subdocument in place,
    // which would otherwise silently rewrite previousPicture to the new values.
    const previousPicture = user.profilePicture
        ? { filename: user.profilePicture.filename, cloudinaryId: user.profilePicture.cloudinaryId }
        : null;

    user.profilePicture = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    try {
        await user.save();
    } catch (err) {
        // Roll back the newly uploaded asset so a failed save doesn't orphan it in Cloudinary
        await deleteEverywhere(req.file.filename, req.file.cloudinary?.publicId);
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        throw err;
    }

    // Delete previous custom media from local disk and Cloudinary, now that the save
    // succeeded and the user document no longer references it. Preserves the shared default image.
    if (previousPicture?.filename && previousPicture.filename !== DEFAULT_PROFILE_PICTURE) {
        await deleteEverywhere(previousPicture.filename, previousPicture.cloudinaryId);
    }

    return res.status(200).json({
        success: true,
        message: "Profile Picture Updated",
        profilePicture: user.profilePicture,
        user,
    });
};

module.exports.uploadProfileBanner = async (req, res) => {
    const user = req.user;

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    // Snapshot as a plain object, not a reference to the live subdocument:
    // assigning user.profileBanner below mutates that subdocument in place,
    // which would otherwise silently rewrite previousBanner to the new values.
    const previousBanner = user.profileBanner
        ? { filename: user.profileBanner.filename, cloudinaryId: user.profileBanner.cloudinaryId }
        : null;

    user.profileBanner = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    try {
        await user.save();
    } catch (err) {
        // Roll back the newly uploaded asset so a failed save doesn't orphan it in Cloudinary
        await deleteEverywhere(req.file.filename, req.file.cloudinary?.publicId);
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        throw err;
    }

    // Delete previous custom banner from local disk and Cloudinary, now that the save
    // succeeded and the user document no longer references it. Preserves default asset.
    if (previousBanner?.filename && previousBanner.filename !== DEFAULT_PROFILE_BANNER) {
        await deleteEverywhere(previousBanner.filename, previousBanner.cloudinaryId);
    }

    return res.status(200).json({
        success: true,
        message: "Profile Banner Updated",
        profileBanner: user.profileBanner,
        user,
    });
};

module.exports.removeProfilePicture = async (req, res) => {
    const user = req.user;

    // Prevent deletion request if the user is already on the fallback default profile image
    if(!user.profilePicture?.filename || user.profilePicture.filename === DEFAULT_PROFILE_PICTURE){
        return res.status(400).json({message: "No profile picture to remove"});
    }

    const previousPicture = {
        filename: user.profilePicture.filename,
        cloudinaryId: user.profilePicture.cloudinaryId,
    };

    // Reset reference back to default image asset
    user.profilePicture = { filename: DEFAULT_PROFILE_PICTURE };
    await user.save();

    // Only delete from storage now that the DB no longer references it — deleting
    // first would leave a broken reference behind if the save failed.
    await deleteEverywhere(previousPicture.filename, previousPicture.cloudinaryId);

    return res.status(200).json({
        success: true,
        message: "Profile Picture Removed",
        profilePicture: user.profilePicture,
    });
};

module.exports.removeProfileBanner = async (req, res) => {
    const user = req.user;

    // Prevent deletion request if the user is already on the fallback default banner image
    if(!user.profileBanner?.filename || user.profileBanner.filename === DEFAULT_PROFILE_BANNER){
        return res.status(400).json({message: "No profile banner to remove"});
    }

    const previousBanner = {
        filename: user.profileBanner.filename,
        cloudinaryId: user.profileBanner.cloudinaryId,
    };

    // Reset reference back to default banner asset
    user.profileBanner = { filename: DEFAULT_PROFILE_BANNER };
    await user.save();

    // Only delete from storage now that the DB no longer references it — deleting
    // first would leave a broken reference behind if the save failed.
    await deleteEverywhere(previousBanner.filename, previousBanner.cloudinaryId);

    return res.status(200).json({
        success: true,
        message: "Profile Banner Removed",
        profileBanner: user.profileBanner,
    });
};

/* ------------------------------- Achievements ------------------------------- */

module.exports.getAchievements = async (req, res) => {
    const user = req.user;
    const achievements = await Achievement.find({ student: user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        achievements,
    });
};

module.exports.createAchievement = async (req, res) => {
    const user = req.user;
    const { title, description, issuer, dateEarned, verificationLink } = req.body;

    let achievement;
    try {
        achievement = await Achievement.create({
            student: user._id,
            title,
            description,
            issuer,
            dateEarned: dateEarned || undefined,
            verificationLink,
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        throw err;
    }

    return res.status(201).json({
        success: true,
        message: "Achievement Created",
        achievement,
    });
};

module.exports.updateAchievement = async (req, res) => {
    const user = req.user;
    const { achievementId } = req.params;

    const achievement = await Achievement.findOne({ _id: achievementId, student: user._id });
    if (!achievement) {
        return res.status(404).json({
            message: "Achievement not found",
        });
    }

    const updateData = { ...req.body };
    // Mirror createAchievement: "" comes from a cleared HTML date picker and
    // would otherwise CastError against Mongoose's Date type.
    if ("dateEarned" in updateData && !updateData.dateEarned) {
        achievement.dateEarned = undefined;
        delete updateData.dateEarned;
    }
    Object.assign(achievement, updateData);

    try {
        await achievement.save();
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        throw err;
    }

    return res.status(200).json({
        success: true,
        message: "Achievement Updated",
        achievement,
    });
};

module.exports.deleteAchievement = async (req, res) => {
    const user = req.user;
    const { achievementId } = req.params;

    const achievement = await Achievement.findOne({ _id: achievementId, student: user._id });
    if (!achievement) {
        return res.status(404).json({
            message: "Achievement not found",
        });
    }

    const certificate = achievement.certificate?.filename
        ? { filename: achievement.certificate.filename, cloudinaryId: achievement.certificate.cloudinaryId }
        : null;

    await achievement.deleteOne();

    // Only delete from storage now that the DB record is gone — deleting first
    // would leave a broken reference behind if deleteOne failed.
    if (certificate) {
        await deleteEverywhere(certificate.filename, certificate.cloudinaryId, "auto");
    }

    return res.status(200).json({
        success: true,
        message: "Achievement Deleted",
    });
};

module.exports.uploadCertificate = async (req, res) => {
    const user = req.user;
    const { achievementId } = req.params;

    if (!req.file) {
        return res.status(400).json({
            message: "No certificate uploaded"
        });
    }

    // Scope to the owning student too, so one student can't attach a file to another's achievement
    const achievement = await Achievement.findOne({ _id: achievementId, student: user._id });

    if (!achievement) {
        if (req.file.cloudinary?.publicId) {
            await deleteEverywhere(req.file.filename, req.file.cloudinary.publicId, "auto");
        }
        return res.status(404).json({
            message: "Achievement not found"
        });
    }

    // Snapshot as a plain object, not a reference to the live subdocument:
    // assigning achievement.certificate below mutates that subdocument in
    // place, which would otherwise silently rewrite previousCertificate to
    // the new values.
    const previousCertificate = achievement.certificate
        ? { filename: achievement.certificate.filename, cloudinaryId: achievement.certificate.cloudinaryId }
        : null;

    achievement.certificate = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    try {
        await achievement.save();
    } catch (err) {
        // Roll back the newly uploaded asset so a failed save doesn't orphan it in Cloudinary
        await deleteEverywhere(req.file.filename, req.file.cloudinary?.publicId, "auto");
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        throw err;
    }

    // Delete the old certificate from local disk and Cloudinary, now that the save
    // succeeded and the achievement document no longer references it.
    if (previousCertificate?.filename) {
        await deleteEverywhere(previousCertificate.filename, previousCertificate.cloudinaryId, "auto");
    }

    return res.status(200).json({
        success: true,
        message: "Certificate Uploaded",
        achievement,
    });
};

module.exports.removeCertificate = async (req, res) => {
    const user = req.user;
    const { achievementId } = req.params;

    const achievement = await Achievement.findOne({ _id: achievementId, student: user._id });

    if (!achievement) {
        return res.status(404).json({
            message: "Achievement not found"
        });
    }

    if (!achievement.certificate?.filename) {
        return res.status(400).json({
            message: "No certificate to remove"
        });
    }

    const previousCertificate = {
        filename: achievement.certificate.filename,
        cloudinaryId: achievement.certificate.cloudinaryId,
    };

    achievement.certificate = undefined;
    await achievement.save();

    // Only delete from storage now that the DB no longer references it — deleting
    // first would leave a broken reference behind if the save failed.
    await deleteEverywhere(previousCertificate.filename, previousCertificate.cloudinaryId, "auto");

    return res.status(200).json({
        success: true,
        message: "Certificate Removed",
    });
};

/* ------------------------------ Account Deletion ----------------------------- */

// Irreversible. Cascades through every record that would otherwise dangle:
// - Registrations the student leads are cancelled properly (frees the event
//   slot and promotes the next waitlisted student), not bare-deleted.
// - Likes/Comments are removed one at a time via deleteOne() so their
//   per-document hooks keep Post.likesCount/commentsCount in sync — a plain
//   deleteMany would skip those hooks and leave the caches stale.
// - Follow supports a direct deleteMany: its own hooks aggregate the
//   follower/followerCount sync server-side.
module.exports.deleteUserProfile = async (req, res) => {
    const { password } = req.body;

    // requireAuth's req.user has password unselected (schema default) —
    // re-fetch it explicitly so this irreversible action can't proceed on a
    // hijacked access token alone without confirming the account's password.
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    const userId = user._id;

    const registrations = await Registration.find({
        student: userId,
        status: { $in: ["confirmed", "waitlisted"] },
    }).populate("event");
    for (const registration of registrations) {
        if (!registration.event) continue; // dangling ref safety, same as the HTTP cancel handler
        await cancelRegistrationCore(registration, "Account deleted");
    }

    // Team memberships on registrations OTHER students lead — the cascade
    // above only cleared TeamMember rows for registrations this student led.
    await TeamMember.deleteMany({ student: userId });

    const [likes, comments] = await Promise.all([
        Like.find({ student: userId, isActive: true }),
        Comment.find({ student: userId, isActive: true }),
    ]);
    for (const like of likes) await like.deleteOne();
    for (const comment of comments) await comment.deleteOne();

    await Follow.deleteMany({
        $or: [{ follower: userId }, { following: userId, followingType: "User" }],
    });

    await Promise.all([
        Bookmark.deleteMany({ student: userId }),
        CommunityMembership.deleteMany({ student: userId }),
        CommunityApplication.deleteMany({ student: userId }),
        Notification.deleteMany({ $or: [{ recipient: userId }, { actor: userId }] }),
        // Otherwise communities where this student held a core leadership post
        // retain a dangling coreTeam.user reference to the deleted account.
        Community.updateMany({ "coreTeam.user": userId }, { $pull: { coreTeam: { user: userId } } }),
    ]);

    const achievements = await Achievement.find({ student: userId });
    await Promise.all(
        achievements
            .filter((a) => a.certificate?.filename)
            .map((a) => deleteEverywhere(a.certificate.filename, a.certificate.cloudinaryId, "auto"))
    );
    await Achievement.deleteMany({ student: userId });

    if (user.profilePicture?.filename && user.profilePicture.filename !== DEFAULT_PROFILE_PICTURE) {
        await deleteEverywhere(user.profilePicture.filename, user.profilePicture.cloudinaryId);
    }
    if (user.profileBanner?.filename && user.profileBanner.filename !== DEFAULT_PROFILE_BANNER) {
        await deleteEverywhere(user.profileBanner.filename, user.profileBanner.cloudinaryId);
    }

    await user.deleteOne();
    await releaseEmail(user.email);

    return res.status(200).json({
        success: true,
        message: "Account Deleted",
    });
};


