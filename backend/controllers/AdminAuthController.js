const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const { signAccessToken, signRefreshToken } = require("../utils/signToken");
const { REFRESH_COOKIE_OPTIONS, refreshAccessToken, logout } = require("../utils/refreshAuth");

module.exports.Login = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({message: "All Fields are Required"});
    }

    const emailLower = email.trim().toLowerCase();

    // Explicitly include password hash since schema defaults to select: false
    const admin = await Admin.findOne({email: emailLower}).select("+password");
    if(!admin){
        return res.status(404).json({message: "Admin Account Does NOT Exists"});
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if(!isMatch){
        return res.status(400).json({message: "Invalid Credentials"});
    }

    // Attach administrative role to token payload for downstream RBAC authorization checks
    const accessToken = signAccessToken(admin._id, "admin");
    const refreshToken = signRefreshToken(admin._id, "admin");

    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({message: "LoggedIn Successfully", accessToken, role: "admin"});
}

module.exports.RefreshToken = refreshAccessToken("admin");
module.exports.Logout = logout("admin");
