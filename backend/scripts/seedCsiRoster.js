/**
 * seedCsiRoster.js
 * Seeds a realistic, well-defined 17-member Committee Roster for Computer Society of India (CSI) SIES GST.
 * Populates both:
 * 1. Community.coreTeam (Committee Roster, displayed at /organizer/roster & student Core Leadership tab)
 * 2. CommunityMembership (Recruitment Roster, displayed at /organizer/recruitment/roster)
 *
 * Uses existing student profiles with verified branches, years, and Unsplash/Cloudinary photos.
 */

const mongoose = require("mongoose");
const Community = require("../src/models/Community");
const CommunityMembership = require("../src/models/CommunityMembership");
const { User } = require("../src/models/User");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscircle";

const COMMITTEE_MEMBERS_PLAN = [
  {
    email: "aarav.patel@campus.edu",
    role: "Lead Organiser / Chairperson",
    wing: "Executive Council",
    daysAgo: 180,
  },
  {
    email: "sneha.kulkarni@campus.edu",
    role: "Co-Lead / Vice Chairperson",
    wing: "Executive Council",
    daysAgo: 175,
  },
  {
    email: "ishaan.mehta@campus.edu",
    role: "General Secretary",
    wing: "Executive Council",
    daysAgo: 170,
  },
  {
    email: "kavya.nair@campus.edu",
    role: "Treasurer & Financial Controller",
    wing: "Finance & Sponsorship",
    daysAgo: 165,
  },
  {
    email: "rohan.gupta@campus.edu",
    role: "Technical Lead",
    wing: "Technical",
    daysAgo: 160,
  },
  {
    email: "priya.sharma@campus.edu",
    role: "Web & Full-Stack Lead",
    wing: "Technical",
    daysAgo: 155,
  },
  {
    email: "devansh.rao@campus.edu",
    role: "Mobile App Development Lead",
    wing: "Technical",
    daysAgo: 150,
  },
  {
    email: "akshan@gmail.com",
    role: "Technical Associate & Mentor",
    wing: "Technical",
    daysAgo: 120,
  },
  {
    email: "ananya.iyer@campus.edu",
    role: "Design & Creatives Lead",
    wing: "Design & Creative",
    daysAgo: 155,
  },
  {
    email: "siddharth.verma@campus.edu",
    role: "UI/UX & Product Designer",
    wing: "Design & Creative",
    daysAgo: 140,
  },
  {
    email: "tanvi.deshmukh@campus.edu",
    role: "Video & Motion Graphics Editor",
    wing: "Design & Creative",
    daysAgo: 135,
  },
  {
    email: "vivaan.joshi@campus.edu",
    role: "Events & Operations Head",
    wing: "Operations & Events",
    daysAgo: 160,
  },
  {
    email: "aditi.rane@campus.edu",
    role: "Event Operations Coordinator",
    wing: "Operations & Events",
    daysAgo: 130,
  },
  {
    email: "arjun.menon@campus.edu",
    role: "Public Relations (PR) & Outreach Lead",
    wing: "PR & Outreach",
    daysAgo: 150,
  },
  {
    email: "diya.kulkarni@campus.edu",
    role: "Corporate Sponsorship & Partnerships Lead",
    wing: "Finance & Sponsorship",
    daysAgo: 145,
  },
  {
    email: "yash.deshmukh@campus.edu",
    role: "Content & Editorial Writer",
    wing: "Content & Media",
    daysAgo: 130,
  },
  {
    email: "niranjan@gmail.com",
    role: "Social Media & Community Engagement Lead",
    wing: "Content & Media",
    daysAgo: 110,
  },
];

async function seedCsiRoster() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for CSI Roster seeding...");

  const csi = await Community.findOne({ name: /Computer Society of India/i });
  if (!csi) {
    console.error("CSI community not found!");
    process.exit(1);
  }
  console.log(`Found CSI Community: ${csi.name} (${csi._id})`);

  const emails = COMMITTEE_MEMBERS_PLAN.map((m) => m.email);
  const students = await User.find({ email: { $in: emails } });
  const studentByEmail = new Map(students.map((s) => [s.email.toLowerCase(), s]));

  console.log(`Found ${students.length}/${emails.length} student records for the planned roster.`);

  const coreTeamEntries = [];
  const membershipDocs = [];

  for (const item of COMMITTEE_MEMBERS_PLAN) {
    const student = studentByEmail.get(item.email.toLowerCase());
    if (!student) {
      console.warn(`Student with email ${item.email} not found. Skipping.`);
      continue;
    }

    const joinedAt = new Date(Date.now() - item.daysAgo * 86400000);

    coreTeamEntries.push({
      user: student._id,
      role: item.role,
      wing: item.wing,
      joinedAt,
      roleHistory: [
        {
          role: item.role,
          changedAt: joinedAt,
        },
      ],
    });

    membershipDocs.push({
      community: csi._id,
      student: student._id,
      label: item.role,
      wing: item.wing,
      joinedAt,
      labelAssignedAt: joinedAt,
      labelHistory: [
        {
          label: item.role,
          changedAt: joinedAt,
        },
      ],
      isActive: true,
    });
  }

  // Update CSI's coreTeam array
  csi.coreTeam = coreTeamEntries;
  // Also update leadOrganizer string to match chairperson
  csi.leadOrganizer = "Aarav Patel";
  await csi.save();
  console.log(`Successfully updated CSI coreTeam with ${coreTeamEntries.length} members!`);

  // Upsert community memberships so recruitment roster is also in sync
  for (const m of membershipDocs) {
    await CommunityMembership.findOneAndUpdate(
      { community: m.community, student: m.student },
      {
        $set: {
          label: m.label,
          wing: m.wing,
          joinedAt: m.joinedAt,
          labelAssignedAt: m.labelAssignedAt,
          labelHistory: m.labelHistory,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
  }
  console.log(`Successfully synchronized ${membershipDocs.length} CommunityMembership records!`);

  console.log("\nSummary of Seeded CSI Committee Roster:");
  for (const entry of coreTeamEntries) {
    const s = studentByEmail.get(
      students.find((u) => u._id.equals(entry.user))?.email?.toLowerCase()
    );
    console.log(
      ` - ${s?.name.padEnd(24)} | ${entry.role.padEnd(42)} | Wing: ${(entry.wing || "General").padEnd(22)} | Branch: ${s?.branch || "N/A"}`
    );
  }

  await mongoose.disconnect();
  console.log("\nDone! CSI Committee Roster seeded successfully.");
}

seedCsiRoster().catch((err) => {
  console.error("Error seeding CSI Roster:", err);
  process.exit(1);
});
