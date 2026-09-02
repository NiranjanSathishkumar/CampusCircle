const Community = require("../../models/Community");
const { DEFAULT_COMMUNITY_BANNER, DEFAULT_COMMUNITY_LOGO } = require("../../models/Community");
const AuditLog = require("../../models/AuditLog");
const { deleteEverywhere } = require("../../utils/fileStorage");
const { reserveEmail, releaseEmail } = require("../../utils/ensureEmailUnique");
const { sendSaveError } = require("../../utils/mongooseSaveError");

module.exports.uploadLogo = async (req, res) => {
    const community = req.community;

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    // Keep a reference to the existing custom logo (protecting the shared default) but
    // don't delete it yet - it must stay recoverable until the new one is confirmed saved.
    const previousLogo = community.logo?.filename && community.logo.filename !== DEFAULT_COMMUNITY_LOGO
        ? { filename: community.logo.filename, cloudinaryId: community.logo.cloudinaryId }
        : null;

    community.logo = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    try {
        await community.save();
    } catch (err) {
        // Save failed - the DB never ended up pointing at the new upload, so clean it up
        // here instead of orphaning it in Cloudinary/disk.
        await deleteEverywhere(req.file.filename, req.file.cloudinary?.publicId);
        if (sendSaveError(err, res)) return;
        throw err;
    }

    // Only now that the DB durably points at the new logo is it safe to remove the old one.
    if (previousLogo) {
        await deleteEverywhere(previousLogo.filename, previousLogo.cloudinaryId);
    }

    return res.status(200).json({ success: true, message: "Community Logo Updated", logo: community.logo });
};

module.exports.uploadBanner = async (req, res) => {
    const community = req.community;

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    // Keep a reference to the existing custom banner (protecting the shared default) but
    // don't delete it yet - it must stay recoverable until the new one is confirmed saved.
    const previousBanner = community.banner?.filename && community.banner.filename !== DEFAULT_COMMUNITY_BANNER
        ? { filename: community.banner.filename, cloudinaryId: community.banner.cloudinaryId }
        : null;

    community.banner = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    try {
        await community.save();
    } catch (err) {
        // Save failed - the DB never ended up pointing at the new upload, so clean it up
        // here instead of orphaning it in Cloudinary/disk.
        await deleteEverywhere(req.file.filename, req.file.cloudinary?.publicId);
        if (sendSaveError(err, res)) return;
        throw err;
    }

    // Only now that the DB durably points at the new banner is it safe to remove the old one.
    if (previousBanner) {
        await deleteEverywhere(previousBanner.filename, previousBanner.cloudinaryId);
    }

    return res.status(200).json({ success: true, message: "Community Banner Updated", banner: community.banner });
};

module.exports.removeLogo = async (req, res) => {
    const community = req.community;

    // Reject removal if logo is missing or already set to default logo fallback
    if (!community.logo?.filename || community.logo.filename === DEFAULT_COMMUNITY_LOGO) {
        return res.status(400).json({ message: "No logo to remove" });
    }

    const previousLogo = { filename: community.logo.filename, cloudinaryId: community.logo.cloudinaryId };

    // Reset reference back to default community logo asset
    community.logo = { filename: DEFAULT_COMMUNITY_LOGO };
    try {
        await community.save();
    } catch (err) {
        if (sendSaveError(err, res)) return;
        throw err;
    }

    // Only delete the old asset once the DB no longer references it, so a failed
    // save leaves the existing logo intact instead of permanently losing it.
    await deleteEverywhere(previousLogo.filename, previousLogo.cloudinaryId);

    return res.status(200).json({ success: true, message: "Community Logo Removed", logo: community.logo });
};

module.exports.removeBanner = async (req, res) => {
    const community = req.community;

    // Reject removal if banner is missing or already set to default banner fallback
    if (!community.banner?.filename || community.banner.filename === DEFAULT_COMMUNITY_BANNER) {
        return res.status(400).json({ message: "No banner to remove" });
    }

    const previousBanner = { filename: community.banner.filename, cloudinaryId: community.banner.cloudinaryId };

    // Reset reference back to default community banner asset
    community.banner = { filename: DEFAULT_COMMUNITY_BANNER };
    try {
        await community.save();
    } catch (err) {
        if (sendSaveError(err, res)) return;
        throw err;
    }

    // Only delete the old asset once the DB no longer references it, so a failed
    // save leaves the existing banner intact instead of permanently losing it.
    await deleteEverywhere(previousBanner.filename, previousBanner.cloudinaryId);

    return res.status(200).json({ success: true, message: "Community Banner Removed", banner: community.banner });
};

module.exports.getCommunityInfo = async (req, res) => {
    return res.status(200).json({ success: true, community: req.community });
};

// Self-scoped login history for the organizer's own shared account (models/AuditLog.js).
// Always filtered to req.community - an organizer can't pass another community's id to
// see its logins, unlike the admin's cross-community /api/admin/audit-logs.
module.exports.getAuditLogs = async (req, res) => {
    const { page, limit } = req.query;
    const filter = { community: req.community._id };

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, logs, page, limit, total, totalPages: Math.ceil(total / limit) });
};

module.exports.updateCommunityInfo = async (req, res) => {
    const community = req.community;
    // validate(infoSchema.updateInfo) has already dropped unknown keys and trimmed
    // these values; email additionally arrives lowercased.
    const updatedCommunityData = req.body;

    // Snapshot before any mutation so a failed save can be rolled back to the
    // exact state we started from (mirrors students.controller.js's
    // updateUserProfile), instead of leaving req.community/req.user mutated
    // in memory with no corresponding DB write.
    const previousCommunityState = community.toObject({ virtuals: false });

    // null/"" means "unset" - Mongoose's establishedYear validator runs on
    // null too (it isn't skipped like `required`), so passing null straight
    // through would fail save() with "must be a realistic year" instead of
    // clearing the field.
    if ("establishedYear" in updatedCommunityData && !updatedCommunityData.establishedYear) {
        community.establishedYear = undefined;
        delete updatedCommunityData.establishedYear;
    }

    const emailNormalized = updatedCommunityData.email ?? null;
    const emailChanged = Boolean(emailNormalized && emailNormalized !== community.email);
    // Name is stored as typed, so the conflict check lowercases only to compare
    const nameNormalized = updatedCommunityData.name ? updatedCommunityData.name.toLowerCase() : null;
    const nameChanged = Boolean(nameNormalized && community.name && nameNormalized !== community.name.trim().toLowerCase());

    // Name uniqueness only needs to be checked within the Community collection,
    // but the comparison must be case-insensitive (the field itself isn't
    // lowercased in storage) - a plain equality match would silently let
    // "GDG On Campus" and "gdg on campus" both through and defer the conflict
    // to Mongo's E11000, which is case-sensitive and would never catch it.
    if (nameChanged) {
        const nameConflict = await Community.findOne({
            _id: { $ne: community._id },
            name: updatedCommunityData.name,
        }).collation({ locale: "en", strength: 2 });

        if (nameConflict) {
            return res.status(400).json({ message: "Name already in use by another community" });
        }
    }

    // Email uniqueness is enforced cross-collection (User, Community, Admin) via
    // EmailRegistry, not just within Community - see utils/ensureEmailUnique.
    // Reserve the new email atomically before persisting so a student/admin
    // can't win the same email in the same instant.
    if (emailChanged) {
        const reserved = await reserveEmail(emailNormalized, "organizer");
        if (!reserved) {
            return res.status(400).json({ message: "Email already in use by another account" });
        }
    }

    const oldEmail = community.email;
    Object.assign(community, updatedCommunityData);

    try {
        await community.save();
    } catch (err) {
        // Roll back the in-memory document to its pre-mutation state so a failed
        // save doesn't leave req.community holding changes that were never
        // actually persisted.
        community.set(previousCommunityState);
        // Release the newly reserved email so it isn't left permanently locked
        // by an update that never actually landed.
        if (emailChanged) {
            await releaseEmail(emailNormalized);
        }
        // Handle Mongoose validation errors and MongoDB duplicate key constraint failures (code 11000)
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email or name already in use by another community" });
        }
        if (sendSaveError(err, res)) return;
        throw err;
    }

    // Free the old email now that the new one is confirmed saved. Note this is a
    // best-effort step, not a guarantee: if the process crashes in the gap between
    // save() resolving and releaseEmail() completing, the old email is left
    // reserved. That's a narrow window and no worse than the rest of this codebase
    // (no multi-document transactions are used anywhere), but it is not airtight.
    if (emailChanged) {
        await releaseEmail(oldEmail);
    }

    return res.status(200).json({
        success: true,
        message: "Community Info Updated Successfully",
        community
    });
};

