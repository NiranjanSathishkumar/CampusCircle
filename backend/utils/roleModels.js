const { User } = require("../models/User");
const Community = require("../models/Community");
const Admin = require("../models/Admin");

module.exports = {
    student: User,
    organizer: Community,
    admin: Admin,
};

