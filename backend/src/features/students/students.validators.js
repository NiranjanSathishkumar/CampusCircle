const Joi = require("joi");
const { BRANCHES, USER_SOCIAL_PLATFORMS } = require("../../models/User");
const { objectId, email, displayName, url, yearOfJoining } = require("../../validators/common");

// Mirrors the old allowedUpdates whitelist in the controller. Listing a field
// here is what makes it updatable — stripUnknown drops everything else, so
// role, password, isProfileComplete and friends can't be mass-assigned.
const updateProfile = Joi.object({
    name: displayName,
    email,
    rollNo: Joi.string().trim().uppercase().max(50).allow(null, ""),
    prnNo: Joi.string().trim().uppercase().max(50).allow(null, ""),
    branch: Joi.string().valid(...BRANCHES),
    yearOfJoining,
    bio: Joi.string().trim().max(300).allow(null, ""),
    skills: Joi.array().items(Joi.string().trim().max(40)).max(30),
    education: Joi.array().items(Joi.string().trim().max(150)).max(10),
    interestTags: Joi.array().items(Joi.string().trim().lowercase().max(30)).max(20),
    socialLinks: Joi.array()
        .items(Joi.object({
            platform: Joi.string().valid(...USER_SOCIAL_PLATFORMS).required(),
            url: url.required(),
        }))
        .unique("platform")
        .max(5),
}).min(1);

// Without this an unparseable id reaches Mongoose and surfaces as a 500 CastError
const achievementParams = Joi.object({
    achievementId: objectId.required(),
});

const studentParams = Joi.object({
    studentId: objectId.required(),
});

const lookupStudent = Joi.object({
    email,
    studentId: objectId,
}).or("email", "studentId");

const createAchievement = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(1000).allow(null, ""),
    issuer: Joi.string().trim().max(200).allow(null, ""),
    // "" allowed alongside null: cleared HTML/React date inputs submit "" rather than null
    dateEarned: Joi.date().max("now").allow(null, ""),
    verificationLink: url.allow(null, ""),
});

const updateAchievement = Joi.object({
    title: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(1000).allow(null, ""),
    issuer: Joi.string().trim().max(200).allow(null, ""),
    dateEarned: Joi.date().max("now").allow(null, ""),
    verificationLink: url.allow(null, ""),
}).min(1);

const listBuddies = Joi.object({
    search: Joi.string().trim().max(100).allow(""),
    branch: Joi.string().trim().max(100).allow("", null),
    year: Joi.string().trim().max(50).allow("", null),
    skill: Joi.string().trim().max(50).allow("", null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(30),
    excludeSelf: Joi.boolean().default(false),
});

// Irreversible — require the account's current password so a hijacked
// access token (15-min lifespan, but still) can't alone wipe the account.
const deleteAccount = Joi.object({
    password: Joi.string().required(),
});

module.exports = {
    updateProfile,
    achievementParams,
    studentParams,
    lookupStudent,
    listBuddies,
    createAchievement,
    updateAchievement,
    deleteAccount,
};


