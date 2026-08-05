const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");

module.exports.isLoggedIn = async (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ExpressError(401, "You must be logged in to access this resource"));
    }

    const secret = process.env.TOKEN_KEY || "campus_circle_secret_key";
    try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ExpressError(401, "User not found or token invalid"));
        }
        req.user = user;
        next();
    } catch (err) {
        return next(new ExpressError(401, "Invalid or expired token"));
    }
};

module.exports.userVerification = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.json({ status: false, success: false, message: "No token provided" });
    }

    const secret = process.env.TOKEN_KEY || "campus_circle_secret_key";
    try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        if (user) {
            return res.json({ status: true, success: true, user: user.name });
        }
        return res.json({ status: false, success: false, message: "User not found" });
    } catch (err) {
        return res.json({ status: false, success: false, message: "Invalid or expired token" });
    }
};