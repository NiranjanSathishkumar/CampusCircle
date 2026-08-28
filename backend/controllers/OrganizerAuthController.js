const Community = require("../models/Community");
const bcrypt = require("bcrypt");
const { signAccessToken, signRefreshToken } = require("../utils/signToken");
const { REFRESH_COOKIE_OPTIONS, refreshAccessToken, logout } = require("../utils/refreshAuth");

module.exports.Login = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({message: "All Fields are Required"});
    }

    const emailLower = email.trim().toLowerCase();

    // Query Community schema directly as organizer accounts store credentials alongside community profile
    // Explicitly include password field which is hidden by default in queries
    const community = await Community.findOne({email: emailLower}).select("+password");
    if(!community){
        return res.status(404).json({message: "Organizer Account Does NOT Exists"});
    }

    const isMatch = await bcrypt.compare(password, community.password);
    if(!isMatch){
        return res.status(400).json({message: "Invalid Credentials"});
    }

    // Embed organizer role in JWT payload to grant community management privileges via RBAC middleware
    const accessToken = signAccessToken(community._id, "organizer");
    const refreshToken = signRefreshToken(community._id, "organizer");

    community.refreshToken = refreshToken;
    await community.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({message: "LoggedIn Successfully", accessToken, role: "organizer"});
}

module.exports.RefreshToken = refreshAccessToken("organizer");
module.exports.Logout = logout("organizer");
