const ExpressError = require("./ExpressError");

const REQUIRED_FIELDS = ["branch", "yearOfJoining", "rollNo"];

// Snapshots the profile fields a drive/event asks collectProfileData to
// gather, throwing a 400 naming what's missing rather than silently storing
// an incomplete record. Shared by recruitment applications and event
// registrations.
function buildProfileSnapshot(student, actionLabel = "continuing") {
    const missing = REQUIRED_FIELDS.filter((field) => !student[field]);
    if (missing.length) {
        throw new ExpressError(400, `Complete your profile (${missing.join(", ")}) before ${actionLabel}`);
    }

    return {
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        prnNo: student.prnNo,
        branch: student.branch,
        yearOfJoining: student.yearOfJoining,
    };
}

module.exports = buildProfileSnapshot;
