require("dotenv").config();
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");
const roleModels = require("../utils/roleModels");

module.exports.requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "No Token Provided"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const Model = roleModels[decoded.role];
        if(!Model){
            return res.status(401).json({message: "Invalid Token"});
        }

        const account = await Model.findById(decoded.id);
        if(!account){
            return res.status(404).json({message: "Account Not Found"});
        }

        req.user = account;
        req.role = decoded.role;
        next();

    } catch (err) {
        return res.status(401).json({message: "Invalid or expired token"});
    }
};

module.exports.requireRole = (...allowedRoles) => (req, res, next) => {
    if(!req.role || !allowedRoles.includes(req.role)){
        return res.status(403).json({message: "Forbidden: Insufficient Role"});
    }
    next();
}
