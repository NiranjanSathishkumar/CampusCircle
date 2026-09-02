const { User } = require("../models/User");
const Community = require("../models/Community");
const Admin = require("../models/Admin");
const EmailRegistry = require("../models/EmailRegistry");

// Live read across all three account collections. On its own this is a
// read-then-write race — two signups for different roles can both read
// "available" here before either write lands — so it only runs after
// reserveEmail below has already won the atomic reservation. It exists to
// catch accounts that predate EmailRegistry or were inserted outside the
// signup flow (seeded data, accounts created directly in the DB), which
// have no EmailRegistry row of their own.
async function existsAcrossCollections(emailLower) {
    const [asStudent, asOrganizer, asAdmin] = await Promise.all([
        User.findOne({ email: emailLower }),
        Community.findOne({ email: emailLower }),
        Admin.findOne({ email: emailLower }),
    ]);
    return Boolean(asStudent || asOrganizer || asAdmin);
}

// Atomically claims an email before its account document is created.
// EmailRegistry's unique index means only one concurrent caller can ever
// win this insert for a given email, so a student and organizer/admin
// signing up with the same email at the same instant can no longer both
// pass. Falls back to a live cross-collection check for emails that predate
// the registry; safe to run only after the reservation is held, since no
// other concurrent caller can be holding it at the same time.
module.exports.reserveEmail = async (emailLower, role) => {
    if (process.env.ADMIN_DEBUG && emailLower.includes("admin_club")) {
        console.error("[DEBUG] reserveEmail CALLED for", emailLower, "\n" + new Error().stack);
    }
    try {
        await EmailRegistry.create({ email: emailLower, role });
    } catch (err) {
        if (err.code === 11000) {
            if (process.env.ADMIN_DEBUG) console.error("[DEBUG] EmailRegistry.create 11000 for", emailLower);
            return false;
        }
        throw err;
    }

    const [asStudent, asOrganizer, asAdmin] = await Promise.all([
        require("../models/User").User.findOne({ email: emailLower }),
        require("../models/Community").findOne({ email: emailLower }),
        require("../models/Admin").findOne({ email: emailLower }),
    ]);
    if (process.env.ADMIN_DEBUG) console.error("[DEBUG] existsAcrossCollections", emailLower, { asStudent: !!asStudent, asOrganizer: !!asOrganizer, asAdmin: !!asAdmin });
    if (asStudent || asOrganizer || asAdmin) {
        await EmailRegistry.deleteOne({ email: emailLower });
        return false;
    }

    return true;
};

// Releases a reservation when the account document it was guarding fails to
// save, so the email isn't left permanently locked by an account that was
// never actually created.
module.exports.releaseEmail = async (emailLower) => {
    await EmailRegistry.deleteOne({ email: emailLower });
};
