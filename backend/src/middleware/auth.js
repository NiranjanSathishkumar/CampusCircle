require("../config/env");
const jwt = require("jsonwebtoken");
const roleModels = require("../utils/roleModels");
const { isAccountBlocked, blockedMessage } = require("../utils/accountStatus");

module.exports.requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "No Token Provided"});
    }

    const token = authHeader.split(" ")[1];

    // Scoped to just the signature/expiry check: a malformed or expired token is a
    // client auth failure (401). A DB/connection error from the lookup below is a
    // server-side outage, not an auth failure — folding it into this catch would
    // report it to the client (and to monitoring) as "Invalid or expired token",
    // masking real infrastructure incidents behind auth-looking noise. Left
    // uncaught, Express 5 forwards it to the error handler as a 500 instead.
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({message: "Invalid or expired token"});
    }

    const Model = roleModels[decoded.role];
    if(!Model){
        return res.status(401).json({message: "Invalid Token"});
    }

    const account = await Model.findById(decoded.id);
    if(!account){
        return res.status(404).json({message: "Account Not Found"});
    }

    // Checked on every request (not just at login/refresh) so a deactivated
    // organizer or suspended student is locked out immediately — not just
    // once their current 15-minute access token happens to expire.
    if(isAccountBlocked(decoded.role, account)){
        return res.status(403).json({message: blockedMessage(decoded.role)});
    }

    req.user = account;
    req.role = decoded.role;
    next();
};

module.exports.requireRole = (...allowedRoles) => (req, res, next) => {
    if(!req.role || !allowedRoles.includes(req.role)){
        return res.status(403).json({message: "Forbidden: Insufficient Role"});
    }
    next();
}
