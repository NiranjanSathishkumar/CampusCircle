require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.createSecretToken = (id) => {
    const secret = process.env.TOKEN_KEY || "campus_circle_secret_key";
    return jwt.sign({ id }, secret, {
        expiresIn: 3 * 24 * 60 * 60,
    });
};