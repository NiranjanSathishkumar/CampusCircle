const User = require("../models/User");
const { createSecretToken } = require("../utils/SecretToken");
const ExpressError = require("../utils/ExpressError");

module.exports.Signup = async (req, res) => {
    const { email, password, name, createdAt } = req.body;

    if (!email || !password || !name) {
        throw new ExpressError(400, "All fields (name, email, password) are required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
        throw new ExpressError(400, "User already exists");
    }

    const user = await User.create({
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
        createdAt,
    });

    const token = createSecretToken(user._id);
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
    });

    res.status(201).json({
        message: "User signed up successfully",
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

module.exports.Login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ExpressError(400, "All fields are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
        throw new ExpressError(400, "Incorrect password or email");
    }

    const auth = await user.comparePassword(password);
    if (!auth) {
        throw new ExpressError(400, "Incorrect password or email");
    }

    const token = createSecretToken(user._id);
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
    });

    res.status(200).json({
        message: "User logged in successfully",
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

module.exports.CheckUser = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ExpressError(400, "Email is required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            exists: true,
            message: "An account with this email already exists.",
        });
    }

    return res.status(200).json({
        success: true,
        exists: false,
        message: "Email is available",
    });
};