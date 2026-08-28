const jwt = require("jsonwebtoken");

module.exports.signAccessToken = (id, role) => {
    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: "15m"});
}

module.exports.signRefreshToken = (id, role) => {
    return jwt.sign({id, role}, process.env.JWT_REFRESH_SECRET, {expiresIn: "7d"});
}