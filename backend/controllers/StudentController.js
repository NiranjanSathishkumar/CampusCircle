const { User, DEFAULT_PROFILE_BANNER, DEFAULT_PROFILE_PICTURE } = require("../models/User");
const Achievement = require("../models/Achievement");
const { deleteEverywhere } = require("../utils/fileStorage");
const { ensureEmailUnique } = require("../utils/ensureEmailUnique");

module.exports.uploadCertificate = async(req, res) => {
    const user = req.user;
    const { achievementId } = req.params;

    if(!req.file) {
        return res.status(400).json({
            message: "No certificate uploaded"
        });
    }

    // Scope to the owning student too, so one student can't attach a file to another's achievement
    const achievement = await Achievement.findOne({ _id: achievementId, student: user._id });

    if(!achievement) {
        return res.status(404).json({
            message: "Achievement not found"
        });
    }

    // Delete the old certificate from local disk and Cloudinary before replacing it
    if(achievement.certificate?.filename) {
        await deleteEverywhere(achievement.certificate.filename, achievement.certificate.cloudinaryId);
    }

    achievement.certificate = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    await achievement.save();
    return res.status(200).json({ message: "Certificate Uploaded", achievement });
}

module.exports.removeCertificate = async(req, res) => {
    const user = req.user;
    const { achievementId } = req.params;

    const achievement = await Achievement.findOne({ _id: achievementId, student: user._id });

    if(!achievement) {
        return res.status(404).json({
            message: "Achievement not found"
        });
    }

    if(!achievement.certificate?.filename) {
        return res.status(400).json({
            message: "No certificate to remove"
        });
    }

    await deleteEverywhere(achievement.certificate.filename, achievement.certificate.cloudinaryId);

    achievement.certificate = undefined;
    await achievement.save();

    return res.status(200).json({ message: "Certificate Removed" });
}


module.exports.uploadProfilePicture = async (req, res) => {
    const user = req.user;

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    // Delete previous custom media from local disk and Cloudinary while preserving the shared default image
    if (user.profilePicture?.filename && user.profilePicture.filename !== DEFAULT_PROFILE_PICTURE) {
        await deleteEverywhere(user.profilePicture.filename, user.profilePicture.cloudinaryId);
    }

    user.profilePicture = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    await user.save();
    return res.status(200).json({ message: "Profile Picture Updated" });
}

module.exports.uploadProfileBanner = async (req, res) => {
    const user = req.user;

    if (!req.file) {
    return res.status(400).json({
        message: "No image uploaded"
    });
    }

    // Delete previous custom banner from local disk and Cloudinary while preserving default asset
    if (user.profileBanner?.filename && user.profileBanner.filename !== DEFAULT_PROFILE_BANNER) {
        await deleteEverywhere(user.profileBanner.filename, user.profileBanner.cloudinaryId);
    }

    user.profileBanner = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    await user.save();
    return res.status(200).json({message: "Profile Banner Updated"})
}

module.exports.getUserProfile = async(req, res) => {
    return res.status(200).json({success: true, user: req.user});
}

module.exports.updateUserProfile = async (req, res) => {
    const user = req.user;
    const updatedUserData = req.body;

    // Check for unique field conflicts across other users in a single database query ($ne current user)
    const conflictConditions = [];
    const emailNormalized = typeof updatedUserData.email === "string" ? updatedUserData.email.trim().toLowerCase() : null;
    const rollNoNormalized = typeof updatedUserData.rollNo === "string" ? updatedUserData.rollNo.trim().toUpperCase() : null;
    const prnNoNormalized = typeof updatedUserData.prnNo === "string" ? updatedUserData.prnNo.trim().toUpperCase() : null;

    if (emailNormalized && emailNormalized !== user.email) {
        conflictConditions.push({ field: "email", condition: { email: emailNormalized } });
    }
    if (rollNoNormalized && rollNoNormalized !== user.rollNo) {
        conflictConditions.push({ field: "rollNo", condition: { rollNo: rollNoNormalized } });
    }
    if (prnNoNormalized && prnNoNormalized !== user.prnNo) {
        conflictConditions.push({ field: "prnNo", condition: { prnNo: prnNoNormalized } });
    }

    if (conflictConditions.length > 0) {
        const existingUsers = await User.find({
            _id: { $ne: user._id },
            $or: conflictConditions.map(c => c.condition)
        });

        const fieldLabels = { email: "Email", rollNo: "Roll Number", prnNo: "PRN Number" };
        const conflictingFields = new Set();

        for (const existingUser of existingUsers) {
            for (const { field } of conflictConditions) {
                if (field === "email" && existingUser.email === emailNormalized) conflictingFields.add(field);
                if (field === "rollNo" && existingUser.rollNo === rollNoNormalized) conflictingFields.add(field);
                if (field === "prnNo" && existingUser.prnNo === prnNoNormalized) conflictingFields.add(field);
            }
        }

        if (conflictingFields.size > 0) {
            const labels = [...conflictingFields].map(f => fieldLabels[f]);
            return res.status(400).json({
                message: `${labels.join(", ")} already in use by another user`
            });
        }
    }

    // Whitelist updatable fields to prevent unauthorized mass-assignment of internal attributes (e.g., role)
    const allowedUpdates = [
        "name",
        "email",
        "rollNo",
        "prnNo",
        "branch",
        "yearOfJoining",
        "bio",
        "skills",
        "education",
        "socialLinks",
        "interestTags"
    ];

    for (const key of Object.keys(updatedUserData)) {
        if (!allowedUpdates.includes(key)) continue;

        if (allowedUpdates.includes(key)) {
            if (key === "email" && typeof updatedUserData[key] === "string") {
                user[key] = updatedUserData[key].trim().toLowerCase();
            } else if ((key === "rollNo" || key === "prnNo") && typeof updatedUserData[key] === "string") {
                user[key] = updatedUserData[key].trim().toUpperCase();
            } else {
                user[key] = updatedUserData[key];
            }
        }
    }

    await user.save();

    return res.status(200).json({
        message: "User Profile Updated Successfully",
        user
    });
};


module.exports.removeProfilePicture = async (req, res) => {
    const user = req.user;

    // Prevent deletion request if the user is already on the fallback default profile image
    if(!user.profilePicture?.filename || user.profilePicture.filename === DEFAULT_PROFILE_PICTURE){
        return res.status(400).json({message: "No profile picture to remove"});
    }

    await deleteEverywhere(user.profilePicture.filename, user.profilePicture.cloudinaryId);

    // Reset reference back to default image asset
    user.profilePicture = { filename: DEFAULT_PROFILE_PICTURE };
    await user.save();

    return res.status(200).json({message: "Profile Picture Removed"});
};

module.exports.removeProfileBanner = async (req, res) => {
    const user = req.user;

    // Prevent deletion request if the user is already on the fallback default banner image
    if(!user.profileBanner?.filename || user.profileBanner.filename === DEFAULT_PROFILE_BANNER){
        return res.status(400).json({message: "No profile banner to remove"});
    }

    await deleteEverywhere(user.profileBanner.filename, user.profileBanner.cloudinaryId);

    // Reset reference back to default banner asset
    user.profileBanner = { filename: DEFAULT_PROFILE_BANNER };
    await user.save();

    return res.status(200).json({message: "Profile Banner Removed"});
}

