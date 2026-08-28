const jwt = require("jsonwebtoken");
const roleModels = require("./roleModels");
const { signAccessToken } = require("./signToken");

// SameSite=None is required for a cross-site frontend/backend deployment (e.g. separate
// domains in production) to receive this cookie on fetch/XHR calls; it mandates Secure,
// which is why both are tied to NODE_ENV together. Locally, "lax" works fine same-site
// without requiring HTTPS.
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

// Returns a RefreshToken handler bound to one role, backed by roleModels' role -> Model map
const refreshAccessToken = (role) => async (req, res) => {
    const token = req.cookies.refreshToken;
    if(!token){
        return res.status(401).json({message: "No Refresh Token Provided"});
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        return res.status(403).json({message: "Invalid or Expired Refresh Token"});
    }

    // A refresh token issued for another role must never be accepted here, even though
    // all roles share the same JWT_REFRESH_SECRET
    if(decoded.role !== role){
        return res.status(403).json({message: "Invalid Refresh Token"});
    }

    const Model = roleModels[role];
    const account = await Model.findById(decoded.id).select("+refreshToken");
    if(!account || account.refreshToken !== token){
        return res.status(403).json({message: "Refresh Token Revoked"});
    }

    const accessToken = signAccessToken(account._id, role);
    return res.status(200).json({accessToken});
};

// Returns a Logout handler bound to one role
const logout = (role) => async (req, res) => {
    const token = req.cookies.refreshToken;
    if(token){
        const Model = roleModels[role];
        await Model.updateOne({ refreshToken: token }, { $unset: { refreshToken: 1 } });
    }
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    return res.status(200).json({message: "Logged Out Successfully"});
};

module.exports = { REFRESH_COOKIE_OPTIONS, refreshAccessToken, logout };
