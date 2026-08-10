const Community = require("../models/Community");
const bcrypt = require("bcrypt");
const { signToken } = require("../utils/signToken");

module.exports.Login = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({message: "All Fields are Required"});
    }

    const emailLower = email.trim().toLowerCase();

    const community = await Community.findOne({email: emailLower}).select("+password");
    if(!community){
        return res.status(404).json({message: "Organizer Account Does NOT Exists"});
    }

    const isMatch = await bcrypt.compare(password, community.password);
    if(!isMatch){
        return res.status(400).json({message: "Invalid Credentials"});
    }

    const token = signToken(community._id, "organizer");
    return res.status(200).json({message: "LoggedIn Successfully", token, role: "organizer"});
}