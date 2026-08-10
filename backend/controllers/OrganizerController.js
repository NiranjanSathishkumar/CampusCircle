const { User } = require("../models/User");
const Community = require("../models/Community");
const { DEFAULT_COMMUNITY_BANNER, DEFAULT_COMMUNITY_LOGO } = require("../models/Community");
const { deleteEverywhere } = require("../utils/fileStorage");

module.exports.uploadLogo = async (req, res) => {
    const community = req.community;

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    // Delete existing custom logo file from disk and Cloudinary while protecting the shared default logo
    if (community.logo?.filename && community.logo.filename !== DEFAULT_COMMUNITY_LOGO) {
        await deleteEverywhere(community.logo.filename, community.logo.cloudinaryId);
    }

    community.logo = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    await community.save();
    return res.status(200).json({ message: "Community Logo Updated" });
};

module.exports.uploadBanner = async (req, res) => {
    const community = req.community;

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    // Delete existing custom banner file from disk and Cloudinary while protecting the shared default banner
    if (community.banner?.filename && community.banner.filename !== DEFAULT_COMMUNITY_BANNER) {
        await deleteEverywhere(community.banner.filename, community.banner.cloudinaryId);
    }

    community.banner = {
        filename: req.file.filename,
        cloudinaryUrl: req.file.cloudinary.url,
        cloudinaryId: req.file.cloudinary.publicId,
    };

    await community.save();
    return res.status(200).json({ message: "Community Banner Updated" });
};

module.exports.removeLogo = async (req, res) => {
    const community = req.community;

    // Reject removal if logo is missing or already set to default logo fallback
    if (!community.logo?.filename || community.logo.filename === DEFAULT_COMMUNITY_LOGO) {
        return res.status(400).json({ message: "No logo to remove" });
    }

    await deleteEverywhere(community.logo.filename, community.logo.cloudinaryId);

    // Reset reference back to default community logo asset
    community.logo = { filename: DEFAULT_COMMUNITY_LOGO };
    await community.save();

    return res.status(200).json({ message: "Community Logo Removed" });
};

module.exports.removeBanner = async (req, res) => {
    const community = req.community;

    // Reject removal if banner is missing or already set to default banner fallback
    if (!community.banner?.filename || community.banner.filename === DEFAULT_COMMUNITY_BANNER) {
        return res.status(400).json({ message: "No banner to remove" });
    }

    await deleteEverywhere(community.banner.filename, community.banner.cloudinaryId);

    // Reset reference back to default community banner asset
    community.banner = { filename: DEFAULT_COMMUNITY_BANNER };
    await community.save();

    return res.status(200).json({ message: "Community Banner Removed" });
};

module.exports.getCommunityInfo = async (req, res) => {
    return res.status(200).json({ success: true, community: req.community });
};

module.exports.updateCommunityInfo = async (req, res) => {
    const community = req.community;
    const updatedCommunityData = req.body;

    // Check for email or name conflicts against existing communities in a single query ($ne current community ID)
    const conflictConditions = [];
    const emailNormalized = typeof updatedCommunityData.email === "string" ? updatedCommunityData.email.trim().toLowerCase() : null;
    const nameNormalized = typeof updatedCommunityData.name === "string" ? updatedCommunityData.name.toLowerCase().trim() : null;

    if (emailNormalized && emailNormalized !== community.email) {
        conflictConditions.push({ field: "email", condition: { email: emailNormalized } });
    }
    if (nameNormalized && community.name && nameNormalized !== community.name.trim().toLowerCase()) {
        conflictConditions.push({ field: "name", condition: { name: updatedCommunityData.name } });
    }

    if (conflictConditions.length > 0) {
        const existingCommunities = await Community.find({
            _id: { $ne: community._id },
            $or: conflictConditions.map(c => c.condition)
        });

        const fieldLabels = { email: "Email", name: "Name" };
        const conflictingFields = new Set();

        for (const existingCommunity of existingCommunities) {
            for (const { field } of conflictConditions) {
                if (field === "email" && existingCommunity.email === emailNormalized) conflictingFields.add(field);
                if (field === "name" && existingCommunity.name && existingCommunity.name.trim().toLowerCase() === nameNormalized) conflictingFields.add(field);
            }
        }

        if (conflictingFields.size > 0) {
            const labels = [...conflictingFields].map(f => fieldLabels[f]);
            return res.status(400).json({
                message: `${labels.join(", ")} already in use by another community`
            });
        }
    }

    // Whitelist updatable fields to prevent tampering with internal properties (e.g. password, createdBy)
    const allowedUpdates = [
        "name",
        "description",
        "logo",
        "banner",
        "category",
        "location",
        "establishedYear",
        "isRecruiting",
        "leadOrganizer",
        "email",
    ];

    for (const key of Object.keys(updatedCommunityData)) {
        if (!allowedUpdates.includes(key)) continue;

        if (key === "email" && typeof updatedCommunityData[key] === "string") {
            community[key] = updatedCommunityData[key].trim().toLowerCase();
        } else {
            community[key] = updatedCommunityData[key];
        }
    }

    try {
        await community.save();
    } catch (err) {
        // Handle Mongoose validation errors and MongoDB duplicate key constraint failures (code 11000)
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email or name already in use by another community" });
        }
        return res.status(500).json({ message: "Something went wrong updating the community" });
    }

    return res.status(200).json({
        message: "Community Info Updated Successfully",
        community
    });
};

module.exports.addCoreTeamMember = async (req, res) => {
  const community = req.community;
  const { studentId, role } = req.body;

  if (!studentId || !role) {
    return res.status(400).json({ message: "studentId and role are required" });
  }

  try {
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Support both 'user' (current) and 'student' (legacy) reference properties for backwards compatibility
    if (community.coreTeam.some((m) => (m.user ? m.user.toString() : m.student ? m.student.toString() : "") === studentId)) {
      return res.status(400).json({ message: "This student is already on the core team" });
    }

    // Enforce schema business constraint capping core team size to 50 members
    if (community.coreTeam.length >= 50) {
      return res.status(400).json({ message: "Core team cannot exceed 50 members" });
    }

    community.coreTeam.push({ user: studentId, role: role.trim() });
    await community.save();

    return res.status(200).json({ message: "Core team member added", coreTeam: community.coreTeam });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports.updateCoreTeamMemberRole = async (req, res) => {
  const community = req.community;
  const { studentId } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "role is required" });
  }

  // Lookup member considering both current 'user' key and legacy 'student' key
  const member = community.coreTeam.find((m) => (m.user ? m.user.toString() : m.student ? m.student.toString() : "") === studentId);
  if (!member) {
    return res.status(404).json({ message: "This student is not on the core team" });
  }

  member.role = role.trim();

  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "Role updated", coreTeam: community.coreTeam });
};

module.exports.removeCoreTeamMember = async (req, res) => {
  const community = req.community;
  const { studentId } = req.params;

  const initialLength = community.coreTeam.length;
  // Filter out matching member across both 'user' and legacy 'student' property names
  community.coreTeam = community.coreTeam.filter((m) => (m.user ? m.user.toString() : m.student ? m.student.toString() : "") !== studentId);

  if (community.coreTeam.length === initialLength) {
    return res.status(404).json({ message: "This student is not on the core team" });
  }

  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "Core team member removed", coreTeam: community.coreTeam });
};

module.exports.addTag = async (req, res) => {
  const community = req.community;
  const normalized = req.body.tag?.trim().toLowerCase();

  if (!normalized) return res.status(400).json({ message: "tag is required" });
  if (community.tags.includes(normalized)) return res.status(400).json({ message: "Tag already exists" });
  if (community.tags.length >= 20) return res.status(400).json({ message: "Cannot exceed 20 tags" });

  community.tags.push(normalized);
  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "Tag added", tags: community.tags });
};

module.exports.removeTag = async (req, res) => {
  const community = req.community;
  const normalized = req.params.tag?.trim().toLowerCase();
  const initialLength = community.tags.length;

  community.tags = community.tags.filter((t) => t !== normalized);
  if (community.tags.length === initialLength) return res.status(404).json({ message: "Tag not found" });

  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "Tag removed", tags: community.tags });
};

module.exports.setSocialLink = async (req, res) => {
  const community = req.community;
  const { platform, url } = req.body;
  const validPlatforms = ["github", "linkedin", "discord", "instagram", "twitter"];

  if (!validPlatforms.includes(platform)) return res.status(400).json({ message: "Invalid platform" });
  if (!url) return res.status(400).json({ message: "url is required" });

  // Update URL if platform entry exists; otherwise append new entry if under capacity (10 max)
  const existing = community.socialLinks.find((l) => l.platform === platform);
  if (existing) {
    existing.url = url.trim();
  } else {
    if (community.socialLinks.length >= 10) return res.status(400).json({ message: "Cannot exceed 10 social links" });
    community.socialLinks.push({ platform, url: url.trim() });
  }

  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "Social link saved", socialLinks: community.socialLinks });
};

module.exports.removeSocialLink = async (req, res) => {
  const community = req.community;
  const { platform } = req.params;
  const initialLength = community.socialLinks.length;

  community.socialLinks = community.socialLinks.filter((l) => l.platform !== platform);
  if (community.socialLinks.length === initialLength) return res.status(404).json({ message: "Social link not found" });

  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "Social link removed", socialLinks: community.socialLinks });
};

module.exports.addFaq = async (req, res) => {
  const community = req.community;
  const { question, answer } = req.body;

  if (!question || !answer) return res.status(400).json({ message: "question and answer are required" });
  if (community.faqs.length >= 20) return res.status(400).json({ message: "Cannot exceed 20 FAQs" });

  community.faqs.push({ question: question.trim(), answer: answer.trim() });

  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "FAQ added", faqs: community.faqs });
};

module.exports.updateFaq = async (req, res) => {
  const community = req.community;
  // Locate subdocument using Mongoose subdocument array helper .id()
  const faq = community.faqs.id(req.params.faqId);
  if (!faq) return res.status(404).json({ message: "FAQ not found" });

  if (req.body.question) faq.question = req.body.question.trim();
  if (req.body.answer) faq.answer = req.body.answer.trim();

  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "FAQ updated", faqs: community.faqs });
};

module.exports.removeFaq = async (req, res) => {
  const community = req.community;
  // Locate subdocument using Mongoose subdocument array helper .id()
  const faq = community.faqs.id(req.params.faqId);
  if (!faq) return res.status(404).json({ message: "FAQ not found" });

  // Use Mongoose subdocument .deleteOne() helper method to stage subdocument removal
  faq.deleteOne();
  try {
    await community.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(200).json({ message: "FAQ removed", faqs: community.faqs });
};