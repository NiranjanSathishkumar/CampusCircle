const { User } = require("../models/User");
const Community = require("../models/Community");
const Admin = require("../models/Admin");

module.exports.ensureEmailUnique = async (emailLower) => {
  const [asStudent, asOrganizer, asAdmin] = await Promise.all([
    User.findOne({ email: emailLower }),
    Community.findOne({ email: emailLower }),
    Admin.findOne({ email: emailLower }),
  ]);
  return !(asStudent || asOrganizer || asAdmin);
};