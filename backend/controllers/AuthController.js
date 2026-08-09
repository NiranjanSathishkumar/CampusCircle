const { User } = require("../models/User");
const ExpressError = require("../utils/ExpressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.Signup = async(req, res, next) => {
    const { email, password, name } = req.body;

    if(!email || !password || !name ){
        return res.status(400).json({message: "All Fields are Required"});
    }

    const emailLower = email.trim().toLowerCase();

    const user = await User.findOne({
        email: emailLower   
    });

    if(user){
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
  
    const token = jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );

    return res.status(200).json({message: "LoggedIn Successfully", token});
}