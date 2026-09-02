const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Loads .env if nothing has already done so — config/env.js normally runs first
// via server.js, but a script or test file that imports this module directly
// (without going through config/env.js) would otherwise hit undefined secrets.
// dotenv never overwrites a variable that's already set, so this is a no-op once
// config/env.js (or the real environment) has already populated process.env.
require("dotenv").config();

// Secrets are read at call time rather than cached (see config/env.js) so tests
// can override them per-run. Fails fast with a clear message instead of letting
// jsonwebtoken throw its generic "secretOrPrivateKey must have a value" further
// down the stack.
function requireSecret(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

module.exports.signAccessToken = (id, role) => {
    return jwt.sign({id, role}, requireSecret("JWT_SECRET"), {expiresIn: "15m"});
}

// jti makes every refresh token unique even when two are issued for the same
// account/role within the same second (JWT `iat` only has second precision,
// so without it same-second logins would produce byte-identical tokens —
// colliding entries in the refreshTokens array that a single logout's $pull
// would then remove together instead of just the one session).
module.exports.signRefreshToken = (id, role) => {
    return jwt.sign({id, role, jti: crypto.randomUUID()}, requireSecret("JWT_REFRESH_SECRET"), {expiresIn: "7d"});
}