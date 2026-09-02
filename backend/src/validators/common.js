const Joi = require("joi");

// Shared field fragments so the per-feature schemas stay declarative and the
// constraints keep matching the Mongoose models they mirror.

const objectId = Joi.string().hex().length(24).messages({
    "string.hex": "{#label} must be a valid id",
    "string.length": "{#label} must be a valid id",
});

const email = Joi.string().trim().lowercase().email().max(200);

// Signup/creation only. Login deliberately does NOT reuse this — enforcing a
// length there would reject existing short passwords with a validation error
// instead of "Invalid Credentials", and leak the password policy.
//
// Capped at 72 (not 128) because bcrypt only hashes the first 72 bytes of its
// input — anything beyond that is silently ignored, so two different
// passwords sharing a 72-byte prefix would hash identically. Keeping the
// policy's max at bcrypt's limit means every character actually counts.
const newPassword = Joi.string().min(8).max(72);

const displayName = Joi.string().trim().min(2).max(128);

const url = Joi.string().trim().uri({ scheme: ["http", "https"] }).max(500);

// Re-evaluated on every validation call (unlike a literal .max(new
// Date().getFullYear()) baked in once at module load), so the upper bound
// doesn't freeze to last year's value on a long-running server process that
// crosses a New Year's boundary. {#label} is filled in with whatever field
// this is attached to, so the same validator works for any year field.
const notInFutureYear = (value, helpers) => {
    const currentYear = new Date().getFullYear();
    if (value > currentYear) {
        return helpers.message(`{#label} must be less than or equal to ${currentYear}`);
    }
    return value;
};

// Mirrors the range models/User.js's yearOfJoining itself enforces
// (>= 2015, not in the future) — shared so student signup and profile
// updates can't drift apart on what counts as a valid admission year.
const yearOfJoining = Joi.number().integer().min(2015).custom(notInFutureYear);

// Only used for establishedYear, which the Community model requires to be
// >= 2000 (see models/Community.js) - kept in sync so Joi rejects the same
// range Mongoose would, instead of passing values that later fail save().
// allow(null, "") lets an organizer unset an existing establishedYear
// (the controller turns that into an actual `undefined` before save()).
const year = Joi.number().integer().min(2000).custom(notInFutureYear).allow(null, "");

module.exports = { objectId, email, newPassword, displayName, url, year, yearOfJoining };
