const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const { signToken } = require("../utils/signToken");

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
    const token = signToken(admin._id, "admin");
    return res.status(200).json({message: "LoggedIn Successfully", token, role: "admin"});
}