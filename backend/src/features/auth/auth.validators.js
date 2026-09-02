const Joi = require("joi");
const { BRANCHES } = require("../../models/User");
const { email, newPassword, displayName, yearOfJoining } = require("../../validators/common");

const signup = Joi.object({
    name: displayName.required(),
    email: email.required(),
    password: newPassword.required(),
    // Optional academic identity, collected on the signup form alongside
    // name/email/password. rollNo allows "" so an untouched (optional) field
    // round-trips cleanly instead of failing validation.
    rollNo: Joi.string().trim().uppercase().max(50).allow(null, ""),
    branch: Joi.string().valid(...BRANCHES),
    yearOfJoining,
});

// Login checks presence and email shape only. Applying the full signup
// password rules here would turn "wrong password" into a validation error and
// reject accounts created before the policy existed. The max is still needed
// though: without any bound, an attacker can submit a multi-MB password on
// every request and force bcrypt.compare to hash the whole thing before its
// internal 72-byte truncation kicks in — a cheap way to amplify CPU cost per
// request. 1024 is far above any real password (and above the 72-byte policy
// max) so it never rejects a legitimate login or hints at the real limit.
const login = Joi.object({
    email: email.required(),
    password: Joi.string().max(1024).required(),
});

const checkEmail = Joi.object({
    email: email.required(),
});

module.exports = { signup, login, checkEmail };
