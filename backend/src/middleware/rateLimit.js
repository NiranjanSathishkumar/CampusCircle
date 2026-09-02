const rateLimit = require("express-rate-limit");

// Factories (not shared instances) so each route gets its own counter — a
// flood of student login attempts shouldn't burn through the organizer or
// admin login budget just because they'd otherwise share one limiter.

// Throttles brute-force/credential-stuffing attempts against login endpoints.
// Keyed by IP only (pre-auth, so there's no user identity yet); failed AND
// successful attempts both count so a script can't just retry forever.
const createLoginLimiter = () => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: { message: "Too many login attempts. Please try again later." },
});

// Refresh is hit far more often by legitimate clients (silent token renewal),
// so it gets a looser ceiling than login.
const createRefreshLimiter = () => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: { message: "Too many refresh attempts. Please try again later." },
});

// Signup is public and unauthenticated, so without a limiter a script can mass-create
// accounts; keyed by IP like the login limiter. Legitimate users sign up once, so the
// ceiling is tighter than login.
const createSignupLimiter = () => rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: { message: "Too many signup attempts. Please try again later." },
});

// Hit once per email typed during signup (plus retries as the user edits it),
// so it needs a looser ceiling than signup itself but still bounded — an
// unauthenticated endpoint that echoes back exists:true/false is a mild
// email-enumeration oracle even though the signup form already needs it.
const createCheckEmailLimiter = () => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: { message: "Too many requests. Please try again later." },
});

module.exports = { createLoginLimiter, createRefreshLimiter, createSignupLimiter, createCheckEmailLimiter };
