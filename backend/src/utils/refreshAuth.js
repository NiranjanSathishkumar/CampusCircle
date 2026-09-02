const jwt = require("jsonwebtoken");
const roleModels = require("./roleModels");
const sessionLimits = require("./sessionLimits");
const { signAccessToken, signRefreshToken } = require("./signToken");
const { isAccountBlocked, blockedMessage } = require("./accountStatus");

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

// res.clearCookie merges its options into a `{ expires: new Date(1) }` cookie
// and re-serializes it — if `maxAge` is included, Max-Age wins over Expires
// per the cookie spec, so the "cleared" cookie is actually re-issued with a
// fresh 7-day lifetime instead of being deleted. Use this (no maxAge) for
// every clearCookie call instead of reusing REFRESH_COOKIE_OPTIONS as-is.
const { maxAge: _maxAge, ...CLEAR_COOKIE_OPTIONS } = REFRESH_COOKIE_OPTIONS;

// One cookie per role rather than a single shared "refreshToken" name.
// A shared name meant logging in as one role in any tab overwrote the
// cookie for every other role sharing that browser — the next silent
// refresh for the now-overwritten role would see a token whose decoded
// role didn't match, and clear the cookie outright, destroying a
// perfectly valid session that just happened to not be the most recent
// login. Distinct cookie names let a student, organizer, and admin
// session coexist in the same browser with zero cross-contamination.
const cookieNameFor = (role) => `refreshToken_${role}`;

// Atomically appends a freshly-issued refresh token to an account's session
// list, evicting the oldest session first once the role's concurrent-session
// cap (see sessionLimits.js) is exceeded. Done as a single $push/$slice
// update rather than read-modify-save: two logins racing on the same account
// (e.g. two tabs, or a double-submit) would otherwise both read the same
// array before either write lands, and the second .save() would clobber the
// first's append, silently dropping a just-created session.
const addSession = (target, ...args) => {
    if (args.length === 2) {
        // In-memory helper: addSession(account, role, token)
        const [role, token] = args;
        const limit = sessionLimits[role];
        if (!target.refreshTokens) target.refreshTokens = [];
        target.refreshTokens.push(token);
        if (target.refreshTokens.length > limit) {
            target.refreshTokens = target.refreshTokens.slice(-limit);
        }
        return target.refreshTokens;
    }
    // Database atomic update: addSession(Model, id, role, token)
    const [id, role, token] = args;
    const limit = sessionLimits[role];
    return target.updateOne(
        { _id: id },
        { $push: { refreshTokens: { $each: [token], $slice: -limit } } },
    );
};

// Returns a RefreshToken handler bound to one role, backed by roleModels' role -> Model map
const refreshAccessToken = (role) => async (req, res) => {
    const cookieName = cookieNameFor(role);
    const token = req.cookies[cookieName];
    if(!token){
        return res.status(401).json({message: "No Refresh Token Provided"});
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        // Dead cookie (expired, tampered, or signed with an old secret) — clear it so
        // the client stops resending it on every subsequent request and retrying a
        // refresh that can never succeed.
        res.clearCookie(cookieName, CLEAR_COOKIE_OPTIONS);
        return res.status(403).json({message: "Invalid or Expired Refresh Token"});
    }

    // Each role now has its own cookie name, so this shouldn't normally
    // trigger — kept as defense-in-depth against a forged/tampered cookie
    // value rather than a real cross-role collision.
    if(decoded.role !== role){
        res.clearCookie(cookieName, CLEAR_COOKIE_OPTIONS);
        return res.status(403).json({message: "Invalid Refresh Token"});
    }

    const Model = roleModels[role];
    const newRefreshToken = signRefreshToken(decoded.id, role);

    // Atomic find-and-replace instead of read/modify/save. Two requests racing on the
    // same token — e.g. React StrictMode double-invoking an effect in dev, or two tabs
    // silently refreshing at once — would otherwise both read the old array before
    // either write lands, and the second .save() would clobber the first's rotation,
    // discarding a session that was never actually compromised. Matching on the old
    // token in the query filter means only the first request's update can find it;
    // the loser's filter matches nothing and it falls through to the 403 below.
    const account = await Model.findOneAndUpdate(
        { _id: decoded.id, refreshTokens: token },
        { $set: { "refreshTokens.$": newRefreshToken } },
        { returnDocument: "after" },
    );

    if(!account){
        // Revoked (rotated by a concurrent request, or logged out elsewhere) —
        // this cookie will never work again, so drop it client-side too.
        res.clearCookie(cookieName, CLEAR_COOKIE_OPTIONS);
        return res.status(403).json({message: "Refresh Token Revoked"});
    }

    // A deactivated organizer or suspended student shouldn't keep silently
    // minting fresh access tokens off a refresh token issued before the
    // block — that would let them stay effectively logged in indefinitely
    // by just reloading before each 15-minute access token expires.
    if(isAccountBlocked(role, account)){
        res.clearCookie(cookieName, CLEAR_COOKIE_OPTIONS);
        return res.status(403).json({message: blockedMessage(role)});
    }

    const accessToken = signAccessToken(account._id, role);
    res.cookie(cookieName, newRefreshToken, REFRESH_COOKIE_OPTIONS);
    return res.status(200).json({accessToken, role});
};

// Bound to one role (mirrors refreshAccessToken) so it reads/clears only
// that role's cookie — logging out of the organizer portal no longer needs
// to guess which cookie among several shared names it owns, because now
// each role only ever has one.
const logout = (role) => async (req, res) => {
    const cookieName = cookieNameFor(role);
    const token = req.cookies[cookieName];
    if(token){
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            decoded = null;
        }

        // Clean up against the token's own (verified) role rather than trusting
        // the endpoint's role blindly, and scoped to `_id` — turns this from a
        // full collection scan on an unindexed array into a primary-key lookup.
        const Model = decoded && roleModels[decoded.role];
        if(Model){
            // Nothing besides /refresh and /logout ever touches this array, and
            // /refresh only rewrites the one entry it rotates — sibling sessions
            // that expired naturally (e.g. another device that was never used
            // again) would otherwise sit in the DB forever. Piggyback a sweep of
            // every expired token onto this write so the array doesn't grow
            // unbounded, pulling the presented token alongside them in one op.
            const account = await Model.findById(decoded.id).select("+refreshTokens");
            if(account){
                const tokensToRemove = (account.refreshTokens || []).filter((storedToken) => {
                    if(storedToken === token) return true;
                    try {
                        jwt.verify(storedToken, process.env.JWT_REFRESH_SECRET);
                        return false;
                    } catch (err) {
                        return true;
                    }
                });
                if(tokensToRemove.length){
                    await Model.updateOne({ _id: decoded.id }, { $pull: { refreshTokens: { $in: tokensToRemove } } });
                }
            }
        }
    }
    res.clearCookie(cookieName, CLEAR_COOKIE_OPTIONS);
    return res.status(200).json({message: "Logged Out Successfully"});
};

module.exports = { REFRESH_COOKIE_OPTIONS, CLEAR_COOKIE_OPTIONS, cookieNameFor, addSession, refreshAccessToken, logout };
