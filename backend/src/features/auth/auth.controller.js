const { User } = require("../../models/User");
const Community = require("../../models/Community");
const Admin = require("../../models/Admin");
const bcrypt = require("bcrypt");
const { signAccessToken, signRefreshToken } = require("../../utils/signToken");
const { reserveEmail, releaseEmail } = require("../../utils/ensureEmailUnique");
const { REFRESH_COOKIE_OPTIONS, cookieNameFor, addSession, refreshAccessToken, logout } = require("../../utils/refreshAuth");
const { isAccountBlocked, blockedMessage } = require("../../utils/accountStatus");
const { recordOrganizerLogin } = require("../../services/audit.service");

/* ---------------------------------- Student --------------------------------- */

const studentSignup = async (req, res) => {
    // Shape guaranteed by validate(schema.signup) on the route; email arrives
    // trimmed and lowercased. rollNo/branch/yearOfJoining are optional.
    const { email, password, name, rollNo, branch, yearOfJoining } = req.body;

    // Atomically claim the email across User, Community, and Admin before creating
    // the account — see utils/ensureEmailUnique for why this has to be atomic rather
    // than a plain pre-check.
    const reserved = await reserveEmail(email, "student");

    if(!reserved){
        return res.status(400).json({message: "User Already Exists"});
    }

    // rollNo is a sparse-unique field — an empty string is still a value as
    // far as the unique index is concerned (only a genuinely missing field
    // is skipped), so the second student to leave it blank would collide
    // with the first. Omit it entirely rather than storing "".
    const newUser = new User({
        email,
        password,
        name,
        ...(rollNo ? { rollNo } : {}),
        ...(branch ? { branch } : {}),
        ...(yearOfJoining ? { yearOfJoining } : {}),
    });

    try {
        await newUser.save();
    } catch (err) {
        await releaseEmail(email);
        if(err.code === 11000){
            if(err.keyPattern?.rollNo){
                return res.status(400).json({message: "Roll Number Already In Use"});
            }
            return res.status(400).json({message: "User Already Exists"});
        }
        throw err;
    }

    return res.status(201).json({message: "User Registered Successfully!"});
}

const studentLogin = async (req, res) => {
    const { email, password } = req.body;

    // Explicitly request the password field, hidden by default in the User schema.
    // refreshTokens isn't needed here — addSession appends the new session with a
    // direct $push/$slice update rather than reading/modifying/saving the array.
    const user = await User.findOne({ email }).select("+password");

    // Same status/message whether the account doesn't exist or the password is
    // wrong — distinguishing the two lets an attacker enumerate valid emails.
    if(!user){
        return res.status(401).json({message: "Invalid Credentials"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(401).json({message: "Invalid Credentials"})
    }

    // Checked after the password to avoid leaking account state to someone
    // who hasn't proven they hold valid credentials.
    if(isAccountBlocked("student", user)){
        return res.status(403).json({message: blockedMessage("student")});
    }

    // Short-lived access token for RBAC route authorization + long-lived refresh token
    const accessToken = signAccessToken(user._id, "student");
    const refreshToken = signRefreshToken(user._id, "student");

    await addSession(User, user._id, "student", refreshToken);

    res.cookie(cookieNameFor("student"), refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({message: "LoggedIn Successfully", accessToken, role: "student"});
}

/* --------------------------------- Organizer -------------------------------- */

const organizerLogin = async (req, res) => {
    const { email, password } = req.body;

    // Query Community schema directly as organizer accounts store credentials alongside community profile.
    // Explicitly include the password field, hidden by default in queries — refreshTokens isn't needed
    // here since addSession appends the new session with a direct $push/$slice update.
    const community = await Community.findOne({ email }).select("+password");

    // Same status/message whether the account doesn't exist or the password is
    // wrong — distinguishing the two lets an attacker enumerate valid emails.
    if(!community){
        return res.status(401).json({message: "Invalid Credentials"});
    }

    const isMatch = await bcrypt.compare(password, community.password);
    if(!isMatch){
        return res.status(401).json({message: "Invalid Credentials"});
    }

    // Checked after the password to avoid leaking account state to someone
    // who hasn't proven they hold valid credentials.
    if(isAccountBlocked("organizer", community)){
        return res.status(403).json({message: blockedMessage("organizer")});
    }

    // Embed organizer role in JWT payload to grant community management privileges via RBAC middleware
    const accessToken = signAccessToken(community._id, "organizer");
    const refreshToken = signRefreshToken(community._id, "organizer");

    await addSession(Community, community._id, "organizer", refreshToken);

    // Login-level accountability for the shared organizer account (models/AuditLog.js) -
    // not attributed to whichever person behind it typed the password.
    await recordOrganizerLogin({
        community: community._id,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
    });

    res.cookie(cookieNameFor("organizer"), refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({message: "LoggedIn Successfully", accessToken, role: "organizer"});
}

/* ----------------------------------- Admin ---------------------------------- */

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    // Explicitly include the password field since the schema defaults to select: false.
    // refreshTokens isn't needed here — addSession appends the new session with a
    // direct $push/$slice update rather than reading/modifying/saving the array.
    const admin = await Admin.findOne({ email }).select("+password");

    // Same status/message whether the account doesn't exist or the password is
    // wrong — distinguishing the two lets an attacker enumerate valid emails.
    if(!admin){
        return res.status(401).json({message: "Invalid Credentials"});
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if(!isMatch){
        return res.status(401).json({message: "Invalid Credentials"});
    }

    // Attach administrative role to token payload for downstream RBAC authorization checks
    const accessToken = signAccessToken(admin._id, "admin");
    const refreshToken = signRefreshToken(admin._id, "admin");

    await addSession(Admin, admin._id, "admin", refreshToken);

    res.cookie(cookieNameFor("admin"), refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({message: "LoggedIn Successfully", accessToken, role: "admin"});
}

/* ------------------------------ Email Availability --------------------------- */

// Public pre-check so the signup form can tell a user their email is already
// taken before they've filled in a password, instead of only finding out at
// final submission. Reads the account collections directly rather than
// EmailRegistry — a registry row can exist for someone else's in-progress,
// not-yet-completed signup, which isn't a real conflict yet. There's an
// inherent narrow race (two people checking the same still-free email at
// once will both see it as available), but the atomic reservation in
// reserveEmail — used by the real signup below — is still the actual source
// of truth; this is only ever advisory.
const checkEmailAvailability = async (req, res) => {
    const { email } = req.query;

    const [asStudent, asOrganizer, asAdmin] = await Promise.all([
        User.exists({ email }),
        Community.exists({ email }),
        Admin.exists({ email }),
    ]);

    return res.status(200).json({ exists: Boolean(asStudent || asOrganizer || asAdmin) });
};

/* --------------------------------- Exports ---------------------------------- */
// Grouped per role so routes read as auth.student.login / auth.admin.logout.
// refreshToken and logout both come from role-bound factories in
// utils/refreshAuth, now that each role reads/writes its own cookie name.

module.exports.student = {
    signup: studentSignup,
    login: studentLogin,
    refreshToken: refreshAccessToken("student"),
    logout: logout("student"),
};

module.exports.organizer = {
    login: organizerLogin,
    refreshToken: refreshAccessToken("organizer"),
    logout: logout("organizer"),
};

module.exports.admin = {
    login: adminLogin,
    refreshToken: refreshAccessToken("admin"),
    logout: logout("admin"),
};

module.exports.checkEmailAvailability = checkEmailAvailability;
