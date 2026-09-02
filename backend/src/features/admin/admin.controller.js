const Community = require("../../models/Community");
const { User } = require("../../models/User");
const { reserveEmail, releaseEmail } = require("../../utils/ensureEmailUnique");
const { notifyOrganizerStatusChanged } = require("../../services/notification.service");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// There's exactly one admin identity (not a roster like organizers/students),
// so this just echoes back the account requireAuth already attached to
// req.user — lets the frontend rehydrate the admin's own name/email after a
// silent refresh instead of only knowing "some admin is logged in".
module.exports.getSelf = async (req, res) => {
    return res.status(200).json({ success: true, admin: req.user });
};

module.exports.createOrganizer = async (req, res) => {
    // validate(schema.createOrganizer) has already stripped any key the schema
    // does not declare, so spreading ...rest into the model below is safe.
    const {name, email, password, category, ...rest} = req.body;

    // Community.name isn't lowercased in storage, so a plain equality match
    // would silently let "Robotics Club" and "robotics club" both through and
    // defer the conflict to Mongo's E11000, which is case-sensitive and would
    // never catch it.
    const nameConflict = await Community.findOne({ name }).collation({ locale: "en", strength: 2 });
    if (nameConflict) {
        if (process.env.ADMIN_DEBUG) console.error("[DEBUG] nameConflict hit", name, nameConflict._id, nameConflict.email);
        return res.status(400).json({ message: "Community Name Already In Use" });
    }

    // Atomically claim the email across User, Community, and Admin to prevent
    // collision. The conflict can be a student or admin account just as easily
    // as another organizer, so the message stays role-neutral instead of
    // asserting a specific (possibly wrong) account type.
    const reserved = await reserveEmail(email, "organizer");
    if(!reserved) {
        if (process.env.ADMIN_DEBUG) console.error("[DEBUG] reserveEmail failed", email);
        return res.status(400).json({message: "Email Already In Use"});
    }

    // Organizers are modeled as Community documents that hold authentication credentials and community metadata.
    // password is hashed by Community's pre-save hook.
    const community = new Community({
        ...rest,
        name,
        category,
        email,
        password,
        createdBy: req.user._id,
    });

    try {
        await community.save();
    } catch (err) {
        if (process.env.ADMIN_DEBUG) console.error("[DEBUG] save() failed", err.name, err.code, err.message, err.keyValue);
        await releaseEmail(email);
        // Community.name is also unique, so a save-time E11000 here isn't
        // necessarily the email - it's whichever of the two lost the race
        // against the pre-checks above (see Community.js's unique indexes).
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        if(err.code === 11000){
            return res.status(400).json({message: "Email or Community Name Already In Use"});
        }
        throw err;
    }

    // Re-fetch through the default query projection instead of returning the
    // in-memory `community`, whose password/refreshTokens/reset-token fields
    // are populated in memory even though the schema marks them select: false.
    const createdCommunity = await Community.findById(community._id);

    return res.status(201).json({
        success: true,
        message: "Organizer Account Created Successfully",
        community: createdCommunity,
    });
};

// Community.find() applies the schema's select: false defaults, so
// password/refreshTokens/reset-token fields are already excluded here.
module.exports.listOrganizers = async (req, res) => {
    const { isActive, category, search, page, limit } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [organizers, total] = await Promise.all([
        Community.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Community.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, organizers, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// Deactivating an organizer only flips the flag other reads already filter
// on (Community.isActive, checked across events/posts/recruitment listings) -
// it doesn't touch the account's data or sessions.
module.exports.updateOrganizerStatus = async (req, res) => {
    const { organizerId } = req.params;
    const { isActive } = req.body;

    const community = await Community.findByIdAndUpdate(organizerId, { isActive }, { new: true });
    if (!community) {
        return res.status(404).json({ message: "Organizer not found" });
    }

    await notifyOrganizerStatusChanged({ community: community._id, isActive });

    return res.status(200).json({
        success: true,
        message: `Organizer Account ${isActive ? "Activated" : "Deactivated"}`,
        community,
    });
};

// Read-only platform-wide student directory. Unlike students.controller.js's
// listBuddies (a public discovery endpoint that hides suspended accounts and
// strips email/rollNo), admins need to see every account, suspended or not,
// with the identifiers support/moderation actually needs.
module.exports.listStudents = async (req, res) => {
    const { search, branch, page, limit } = req.query;

    const filter = {};
    if (branch) filter.branch = branch;
    if (search) {
        const regex = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [{ name: regex }, { email: regex }, { rollNo: regex }];
    }

    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
        User.find(filter)
            .select("name email rollNo branch yearOfJoining createdAt isSuspended")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, students, page, limit, total, totalPages: Math.ceil(total / limit) });
};