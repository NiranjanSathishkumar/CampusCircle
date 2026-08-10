const Community = require("../models/Community");
const bcrypt = require("bcrypt");
const { signToken } = require("../utils/signToken");

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
    const token = signToken(community._id, "organizer");
    return res.status(200).json({message: "LoggedIn Successfully", token, role: "organizer"});
}