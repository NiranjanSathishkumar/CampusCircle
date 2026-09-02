const mongoose = require("mongoose");
const { dbUrl } = require("./env");
const { User } = require("../models/User");
const EmailRegistry = require("../models/EmailRegistry");

async function connectDB() {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB successfully");
    await User.syncIndexes();
    // EmailRegistry's unique index on `email` is what makes reserveEmail's
    // cross-collection race guard atomic — must exist before any signup runs.
    await EmailRegistry.syncIndexes();
}

module.exports = connectDB;
