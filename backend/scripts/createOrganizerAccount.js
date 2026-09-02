const mongoose = require("mongoose");
require("dotenv").config();
const Admin = require("../src/models/Admin");
const Community = require("../src/models/Community");
const { reserveEmail } = require("../src/utils/ensureEmailUnique");

const dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscircle";

async function run() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB...");

    // Find or create an admin
    let admin = await Admin.findOne();
    if (!admin) {
      console.log("No Admin found in database. Creating default Admin...");
      admin = new Admin({
        name: "Super Admin",
        email: "admin@campuscircle.com",
        password: "admin_password_123"
      });
      await admin.save();
      console.log("Created admin: admin@campuscircle.com");
    } else {
      console.log(`Using existing Admin: ${admin.email} (${admin._id})`);
    }

    const email = "siesiet@gmail.com";
    const password = "asdf1234";
    const name = "SIESIT Tech Council";
    const category = "Technical";

    // Reserve email
    const reserved = await reserveEmail(email, "organizer");
    if (!reserved) {
      console.log(`Email ${email} is already reserved or in use across collections.`);
      // Check if organizer already exists
      const existingOrg = await Community.findOne({ email });
      if (existingOrg) {
        console.log(`Organizer already exists with ID: ${existingOrg._id}. Updating password...`);
        existingOrg.password = password;
        await existingOrg.save();
        console.log(`Successfully updated password for ${email}`);
        process.exit(0);
      } else {
        console.log("Reservation failed but organizer document not found. Attempting force save...");
      }
    }

    const community = new Community({
      name,
      category,
      email,
      password,
      createdBy: admin._id,
      description: "SIES GST/SIESIT Tech Council community organizer page.",
      establishedYear: 2024,
      location: "Nerul, Navi Mumbai",
      tags: ["tech", "coding", "workshops", "siesiet"],
    });

    await community.save();
    console.log(`Successfully created Organizer account!`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (err) {
    console.error("Error creating Organizer account:", err);
    process.exit(1);
  }
}

run();
