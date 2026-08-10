const Community = require("../models/Community");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");

module.exports.CreateOrganizer = async (req, res) => {
    const {name, email, password, category, ...rest} = req.body;
    if(!name || !email || !password || !category) {
        return res.status(400).json({message: "All Fields are Required"});
    }
    const emailLower = email.trim().toLowerCase();

    const existing = await Community.findOne({email: emailLower});
    if(existing) {
        return res.status(400).json({message: "Organizer Already Exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const community = new Community({
        ...rest,
        name,
        category,
        email: emailLower,
        password: hashedPassword,
        createdBy: req.user._id,
    });

    await community.save();

    return res.status(201).json({message: "Organizer Account Created"});
};