const mongoose = require("mongoose");
const {User, DEFAULT_PROFILE_BANNER, DEFAULT_PROFILE_PICTURE} = require("../models/User");
const ExpressError = require("../utils/ExpressError");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { DEFAULT_CIPHERS } = require("tls");

module.exports.uploadProfilePicture = async (req, res) => {
    const user = req.user;

    // delete the old picture if one exists
    if (user.profilePicture) {
        const oldPath = path.join("uploads", user.profilePicture);
        fs.unlink(oldPath, (err) => {
            if (err && err.code !== "ENOENT") {
                console.error("Failed to delete old profile picture:", err);
            }
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    user.profilePicture = req.file.filename;
    await user.save();

    return res.status(200).json({ message: "Profile Picture Updated" });
}

module.exports.uploadProfileBanner = async (req, res) => {
    const user = req.user;

    // delete the old banner if one exists
    if (user.profileBanner) {
        const oldPath = path.join("uploads", user.profileBanner);
        fs.unlink(oldPath, (err) => {
            if (err && err.code !== "ENOENT") {
                console.error("Failed to delete old profile banner:", err);
            }
        });
    }

    if (!req.file) {
    return res.status(400).json({
        message: "No image uploaded"
    });
    }

    user.profileBanner = req.file.filename;
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
    if (updatedUserData.email && updatedUserData.email.trim().toLowerCase() !== user.email) {
        conflictConditions.push({ email: updatedUserData.email.trim().toLowerCase() });
    }
    if (updatedUserData.rollNo && updatedUserData.rollNo.trim().toUpperCase() !== user.rollNo) {
        conflictConditions.push({ rollNo: updatedUserData.rollNo.trim().toUpperCase() });
    }
    if (updatedUserData.prnNo && updatedUserData.prnNo.trim().toUpperCase() !== user.prnNo) {
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

    if(!user.profilePicture){
        return res.status(400).json({message: "No profile picture to remove"});
    }

    const oldPath = path.join("uploads", user.profilePicture);
    fs.unlink(oldPath, (err) => {
        if(err && err.code != "ENOENT"){
            console.error("Failed to delete profile picture: ", err);
        }
    });

    user.profilePicture = DEFAULT_PROFILE_PICTURE;
    await user.save();

    return res.status(200).json({message: "Profile Picture Removed"});
};

module.exports.removeProfileBanner = async (req, res) => {
    const user = req.user;

    if(!user.profileBanner){
        return res.status(400).json({message: "No profile banner to remove"});
    }

    const oldPath = path.join("uplods", user.profileBanner);
    fs.unlink(oldPath, (err) => {
        if(err && err.code !== "ENOENT"){
            console.error("Failed to delete profile banner: ", err);
        }
    });

    user.profileBanner = DEFAULT_PROFILE_BANNER;
    await user.save();

    return res.status(200).json({message: "Profile Banner Removed"});
}

