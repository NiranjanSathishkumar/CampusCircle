// The field name for "this account is blocked" differs per role model —
// Community uses isActive (flipped off by an admin), User uses isSuspended
// (a moderation action) — and Admin has no such concept at all. Centralized
// here so login, refresh, and requireAuth can't drift on what "blocked"
// means for a given role.
function isAccountBlocked(role, account) {
    if (role === "organizer") return account.isActive === false;
    if (role === "student") return account.isSuspended === true;
    return false;
}

function blockedMessage(role) {
    if (role === "organizer") return "This organizer account has been deactivated";
    if (role === "student") return "This account has been suspended";
    return "This account is not active";
}

module.exports = { isAccountBlocked, blockedMessage };
