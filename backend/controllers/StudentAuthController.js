const { User } = require("../models/User");
const ExpressError = require("../utils/ExpressError");
const bcrypt = require("bcrypt");
const { signAccessToken, signRefreshToken } = require("../utils/signToken");
const { ensureEmailUnique } = require("../utils/ensureEmailUnique");
const { REFRESH_COOKIE_OPTIONS, refreshAccessToken, logout } = require("../utils/refreshAuth");

module.exports.Signup = async(req, res, next) => {
    const { email, password, name } = req.body;

    if(!email || !password || !name ){
        return res.status(400).json({message: "All Fields are Required"});
    }

    const emailLower = email.trim().toLowerCase();

    // Check email uniqueness across User, Community, and Admin models to avoid cross-role duplicates
    const isUnique = await ensureEmailUnique(emailLower);

    if(!isUnique){
        return res.status(400).json({message: "User Already Exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        email: emailLower,
        password: hashedPassword,
        name
    });

    await newUser.save();

    return res.status(201).json({message: "User Registered Successfully!"});
}

module.exports.Login = async(req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "All Fields are Required"});
    }

    const emailLower = email.trim().toLowerCase();

    // Explicitly request password field which is hidden by default in the User schema
    const user = await User.findOne({
        email: emailLower
    }).select("+password");

    if(!user){
        return res.status(404).json({message: "User Does NOT Exists"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({message: "Invalid Credentials"})
    }

    // Short-lived access token for RBAC route authorization + long-lived refresh token
    const accessToken = signAccessToken(user._id, "student");
    const refreshToken = signRefreshToken(user._id, "student");

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({message: "LoggedIn Successfully", accessToken, role: "student"});
}

module.exports.RefreshToken = refreshAccessToken("student");
module.exports.Logout = logout("student");