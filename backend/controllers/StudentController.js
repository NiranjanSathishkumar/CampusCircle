const { User, DEFAULT_PROFILE_BANNER, DEFAULT_PROFILE_PICTURE } = require("../models/User");
const { deleteEverywhere } = require("../utils/fileStorage");


module.exports.uploadProfilePicture = async (req, res) => {
    const user = req.user;

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

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

    // Check unique constraints for email, rollNo, and prnNo against other users
    const conflictConditions = [];
    if (typeof updatedUserData.email === "string" && updatedUserData.email.trim().toLowerCase() !== user.email) {
        conflictConditions.push({ email: updatedUserData.email.trim().toLowerCase() });
    }
    if (typeof updatedUserData.rollNo === "string" && updatedUserData.rollNo.trim().toUpperCase() !== user.rollNo) {
        conflictConditions.push({ rollNo: updatedUserData.rollNo.trim().toUpperCase() });
    }
    if (typeof updatedUserData.prnNo === "string" && updatedUserData.prnNo.trim().toUpperCase() !== user.prnNo) {
        conflictConditions.push({ prnNo: updatedUserData.prnNo.trim().toUpperCase() });
    }

    if (conflictConditions.length > 0) {
        const existingUser = await User.findOne({
            _id: { $ne: user._id },
            $or: conflictConditions
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email, Roll Number, or PRN Number already in use by another user" });
        }
    }

    // Allowed profile fields in User schema
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

    if(!user.profilePicture?.filename || user.profilePicture.filename === DEFAULT_PROFILE_PICTURE){
        return res.status(400).json({message: "No profile picture to remove"});
    }

    await deleteEverywhere(user.profilePicture.filename, user.profilePicture.cloudinaryId);

    user.profilePicture = { filename: DEFAULT_PROFILE_PICTURE };
    await user.save();

    return res.status(200).json({message: "Profile Picture Removed"});
};

module.exports.removeProfileBanner = async (req, res) => {
    const user = req.user;

    if(!user.profileBanner?.filename || user.profileBanner.filename === DEFAULT_PROFILE_BANNER){
        return res.status(400).json({message: "No profile banner to remove"});
    }

    await deleteEverywhere(user.profileBanner.filename, user.profileBanner.cloudinaryId);

    user.profileBanner = { filename: DEFAULT_PROFILE_BANNER };
    await user.save();

    return res.status(200).json({message: "Profile Banner Removed"});
}

