const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");

module.exports.requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "No Token Provided"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if(!user) {
            return res.status(404).json({message: "User NOT Found"});
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({message: "Invalid or expired token"});
    }
};
