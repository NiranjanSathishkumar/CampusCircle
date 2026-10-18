const { User } = require("../../models/User");
const { sendSaveError } = require("../../utils/mongooseSaveError");

// Core team, tags, social links and FAQs — all array-of-subdocument fields on the
// Community doc, edited by the logged-in organizer via req.community.

// Shared across all three core-team mutations so add/update/remove return the
// same { user, role, student } shape instead of each inventing its own.
const serializeStudent = (student) => student && ({
  _id: student._id,
  name: student.name,
  email: student.email,
  branch: student.branch,
  yearOfJoining: student.yearOfJoining,
  profilePicture: student.profilePicture,
});

module.exports.addCoreTeamMember = async (req, res) => {
  const community = req.community;
  const { studentId, email, role } = req.body;

  let student;
  if (studentId) {
    student = await User.findById(studentId);
    // Both were submitted (e.g. from AddMemberModal) - verify they name the
    // same account instead of silently ignoring studentId and trusting email.
    if (student && email && student.email.toLowerCase() !== email.toLowerCase().trim()) {
      return res.status(400).json({ message: "studentId and email refer to different accounts" });
    }
  } else if (email) {
    student = await User.findOne({ email: email.toLowerCase().trim() });
  }

  if (!student) {
    return res.status(404).json({ message: email && !studentId ? `No registered student found with email "${email}"` : "Student not found" });
  }

  const targetId = student._id.toString();

  if (community.coreTeam.some((m) => (m.user?._id || m.user).toString() === targetId)) {
    return res.status(400).json({ message: "This student is already on the core team" });
  }

  // Enforce schema business constraint capping core team size to 50 members
  if (community.coreTeam.length >= 50) {
    return res.status(400).json({ message: "Core team cannot exceed 50 members" });
  }

  const now = new Date();
  community.coreTeam.push({
    user: student._id,
    role,
    joinedAt: now,
    roleHistory: [{ role, changedAt: now }],
  });

  try {
    await community.save();
  } catch (err) {
    // Schema validation failures and version conflicts are the client's fault
    // (400/409); anything else (e.g. a DB connection error) is a server-side
    // failure and belongs to the centralized error handler, not a locally
    // fabricated response.
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({
    success: true,
    message: "Core team member added",
    coreTeam: community.coreTeam,
    member: { user: student._id, role, student: serializeStudent(student) },
  });
};

module.exports.updateCoreTeamMemberRole = async (req, res) => {
  const community = req.community;
  const { studentId } = req.params;
  const { role } = req.body;

  const member = community.coreTeam.find((m) => m.user.toString() === studentId);
  if (!member) {
    return res.status(404).json({ message: "This student is not on the core team" });
  }

  // Append old role to history before overwriting
  if (!member.roleHistory) member.roleHistory = [];
  member.roleHistory.push({ role, changedAt: new Date() });
  member.role = role;
  // Optionally update wing in the same request
  if (Object.prototype.hasOwnProperty.call(req.body, 'wing')) {
    member.wing = req.body.wing || null;
  }

  try {
    await community.save();
  } catch (err) {
    if (sendSaveError(err, res)) return;
    throw err;
  }

  const student = await User.findById(member.user);

  return res.status(200).json({
    success: true,
    message: "Role updated",
    coreTeam: community.coreTeam,
    member: { user: member.user, role: member.role, student: serializeStudent(student) },
  });
};

module.exports.removeCoreTeamMember = async (req, res) => {
  const community = req.community;
  const { studentId } = req.params;

  const removedMember = community.coreTeam.find((m) => m.user.toString() === studentId);
  if (!removedMember) {
    return res.status(404).json({ message: "This student is not on the core team" });
  }
  const removedUserId = removedMember.user;
  const removedRole = removedMember.role;
  community.coreTeam = community.coreTeam.filter((m) => m.user.toString() !== studentId);

  try {
    await community.save();
  } catch (err) {
    if (sendSaveError(err, res)) return;
    throw err;
  }

  const student = await User.findById(removedUserId);

  return res.status(200).json({
    success: true,
    message: "Core team member removed",
    coreTeam: community.coreTeam,
    member: { user: removedUserId, role: removedRole, student: serializeStudent(student) },
  });
};

module.exports.bulkRemoveCoreTeamMembers = async (req, res) => {
  const community = req.community;
  const { studentIds } = req.body; // array of ObjectId strings

  const initialLength = community.coreTeam.length;
  community.coreTeam = community.coreTeam.filter(
    (m) => !studentIds.includes(m.user.toString())
  );
  const removedCount = initialLength - community.coreTeam.length;

  try {
    await community.save();
  } catch (err) {
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({
    success: true,
    message: `${removedCount} member(s) removed`,
    coreTeam: community.coreTeam,
    removedCount,
  });
};

module.exports.addTag = async (req, res) => {
  const community = req.community;
  const normalized = req.body.tag;

  if (community.tags.includes(normalized)) return res.status(400).json({ message: "Tag already exists" });
  if (community.tags.length >= 20) return res.status(400).json({ message: "Cannot exceed 20 tags" });

  community.tags.push(normalized);
  try {
    await community.save();
  } catch (err) {
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({ success: true, message: "Tag added", tags: community.tags });
};

module.exports.removeTag = async (req, res) => {
  const community = req.community;
  const normalized = req.params.tag;
  const initialLength = community.tags.length;

  community.tags = community.tags.filter((t) => t !== normalized);
  if (community.tags.length === initialLength) return res.status(404).json({ message: "Tag not found" });

  try {
    await community.save();
  } catch (err) {
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({ success: true, message: "Tag removed", tags: community.tags });
};

module.exports.setSocialLink = async (req, res) => {
  const community = req.community;
  const { platform, url } = req.body;

  // Update URL if platform entry exists; otherwise append new entry if under capacity (10 max)
  const existing = community.socialLinks.find((l) => l.platform === platform);
  if (existing) {
    existing.url = url;
  } else {
    if (community.socialLinks.length >= 10) return res.status(400).json({ message: "Cannot exceed 10 social links" });
    community.socialLinks.push({ platform, url });
  }

  try {
    await community.save();
  } catch (err) {
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({ success: true, message: "Social link saved", socialLinks: community.socialLinks });
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
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({ success: true, message: "Social link removed", socialLinks: community.socialLinks });
};

module.exports.addFaq = async (req, res) => {
  const community = req.community;
  const { question, answer } = req.body;

  if (community.faqs.length >= 20) return res.status(400).json({ message: "Cannot exceed 20 FAQs" });

  community.faqs.push({ question, answer });

  try {
    await community.save();
  } catch (err) {
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({ success: true, message: "FAQ added", faqs: community.faqs });
};

module.exports.updateFaq = async (req, res) => {
  const community = req.community;
  // Locate subdocument using Mongoose subdocument array helper .id()
  const faq = community.faqs.id(req.params.faqId);
  if (!faq) return res.status(404).json({ message: "FAQ not found" });

  if (req.body.question) faq.question = req.body.question;
  if (req.body.answer) faq.answer = req.body.answer;

  try {
    await community.save();
  } catch (err) {
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({ success: true, message: "FAQ updated", faqs: community.faqs });
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
    if (sendSaveError(err, res)) return;
    throw err;
  }

  return res.status(200).json({ success: true, message: "FAQ removed", faqs: community.faqs });
};
