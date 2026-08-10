const jwt = require("jsonwebtoken");

module.exports.signToken = (id, role) => {
    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: "7d"});
}