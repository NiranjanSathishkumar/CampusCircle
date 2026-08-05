const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ExpressError = require("../utils/ExpressError");

// Helper function to escape special regex characters to prevent ReDoS / search crashes
const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// GET /api/profile/me - Fetch logged-in student profile
module.exports.getCurrentProfile = async (req, res) => {
    if (!req.user || !req.user._id) {
        throw new ExpressError(401, "You must be logged in");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ExpressError(404, "User profile not found");
    }

    res.status(200).json({
        success: true,
        user,
    });
};

// GET /api/profile/:id - Fetch student profile by ID or "me"
module.exports.getProfile = async (req, res) => {
    let { id } = req.params;

    if (id === "me") {
        if (!req.user) {
            let token = req.cookies?.token;
            if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
                token = req.headers.authorization.split(" ")[1];
            }
            if (token) {
                try {
                    const secret = process.env.TOKEN_KEY || "campus_circle_secret_key";
                    const decoded = jwt.verify(token, secret);
                    req.user = await User.findById(decoded.id);
                } catch (e) {
                    // Invalid token
                }
            }
        }
        if (!req.user || !req.user._id) {
            throw new ExpressError(401, "You must be logged in to access this profile");
        }
        id = req.user._id.toString();
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid user ID format");
    }

    const user = await User.findById(id);
    if (!user) {
        throw new ExpressError(404, "User profile not found");
    }

    res.status(200).json({
        success: true,
        user,
    });
};

// GET /api/profile - Fetch all students (with optional branch / search filter)
module.exports.getAllStudents = async (req, res) => {
    const { branch, search } = req.query;
    const query = {};

    if (branch && branch !== "All Branches") {
        query.branch = branch;
    }

    if (search && search.trim()) {
        const safeSearch = escapeRegex(search.trim());
        const regex = new RegExp(safeSearch, "i");
        query.$or = [
            { name: regex },
            { skills: regex },
            { interestTags: regex },
            { bio: regex },
        ];
    }

    const students = await User.find(query).select("-password");

    res.status(200).json({
        success: true,
        count: students.length,
        students,
    });
};

// POST /api/profile or PUT /api/profile/:id - Update student profile
module.exports.updateProfile = async (req, res) => {
    const userId = req.user?.id || req.user?._id?.toString();
    let id = req.params.id || userId;

    if (id === "me") {
        id = userId;
    }

    if (!userId || !id || userId.toString() !== id.toString()) {
        throw new ExpressError(403, "You can only update your own profile");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid user ID format");
    }

    const ALLOWED_FIELDS = [
        "name",
        "email",
        "rollNo",
        "prnNo",
        "branch",
        "yearOfJoining",
        "bio",
        "avatar",
        "skills",
        "education",
        "socialLinks",
        "interestTags",
    ];

    const updates = {};
    for (const field of ALLOWED_FIELDS) {
        if (field in req.body) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!user) {
        throw new ExpressError(404, "User profile not found");
    }

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
};

// DELETE /api/profile or DELETE /api/profile/:id - Delete student account
module.exports.deleteProfile = async (req, res) => {
    const userId = req.user?.id || req.user?._id?.toString();
    let id = req.params.id || userId;

    if (id === "me") {
        id = userId;
    }

    if (!userId || !id || userId.toString() !== id.toString()) {
        throw new ExpressError(403, "You can only delete your own profile");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid user ID format");
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new ExpressError(404, "User profile not found");
    }

    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Account deleted successfully" });
};


