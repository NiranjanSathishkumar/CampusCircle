const mongoose = require("mongoose");
require("dotenv").config();

const Post = require("../src/models/Post");
const Community = require("../src/models/Community");
const Like = require("../src/models/Like");
const Comment = require("../src/models/Comment");
const { User } = require("../src/models/User");

const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || "mongodb://127.0.0.1:27017/campuscircle";

// 10 realistic posts across the communities seeded by seedCommunities.js.
const POSTS_DATA = [
  {
    communityKey: "csi@campus.edu",
    title: "Team Byte Force wins Smart India Hackathon 2026 Grand Finale!",
    type: "Achievement",
    content:
      "Huge congratulations to Team Byte Force — four CSI members from Computer Engineering — for winning the Grand Finale of Smart India Hackathon 2026 in the Healthcare track! Their solution, an offline-first triage assistant for rural health workers, beat out 200+ teams from across the country. The team will represent SIES GST at the national showcase next month. Proud of the countless late nights and mock pitches that went into this. 🏆",
    tags: ["hackathon", "achievement", "sih2026", "healthcare"],
    autoDeleteAfterMonths: 6,
  },
  {
    communityKey: "gdsc@campus.edu",
    title: "Reminder: Android 15 Compose Bootcamp is this Tuesday",
    type: "Workshop",
    content:
      "Quick reminder for everyone registered — the Android 15 Compose & Kotlin Multiplatform Bootcamp kicks off Tuesday at 1:30 PM in Computer Center Lab 1. Please have Android Studio Ladybug (or newer) installed with a working emulator before you arrive, since we'll be building the campus companion app live from the first session. Seats are still open if you haven't registered yet — swing by the GDSC desk before Monday evening.",
    tags: ["android", "kotlin", "jetpack-compose", "workshop"],
    autoDeleteAfterMonths: 2,
  },
  {
    communityKey: "owasp@campus.edu",
    title: "CyberSiege CTF 2026 results are in — congrats to team null_ptr",
    type: "Update",
    content:
      "What a night! CyberSiege CTF wrapped up with over 60 teams battling across web exploitation, reverse engineering, crypto, and forensics. Team null_ptr took first place after cracking the hidden boss flag in Binary Exploitation with just 12 minutes on the clock, followed closely by ShellShockers and Ctrl+Alt+Elite. Full writeups from the top 3 teams will be posted on our GitHub this week — huge thanks to everyone who showed up and kept the scoreboard interesting till the very end.",
    tags: ["ctf", "cybersecurity", "results", "owasp"],
    autoDeleteAfterMonths: 4,
  },
  {
    communityKey: "ieee@campus.edu",
    title: "Speaker lineup announced for the Quantum Computing Symposium",
    type: "Announcement",
    content:
      "We're excited to confirm our keynote speakers for the Symposium on Quantum Computing & Silicon Photonics on October 10th: Prof. R. Deshmukh (TIFR) on fault-tolerant quantum architectures, and an Intel Labs Director on co-packaged optics for hyperscale AI clusters. Entry is free and open to all branches, but seats in the Main Auditorium are limited to 120 — register through the Events tab to secure your spot.",
    tags: ["quantum", "ieee", "symposium", "research"],
    autoDeleteAfterMonths: 3,
  },
  {
    communityKey: "ecell@campus.edu",
    title: "VentureCraft '26 seed grant winners announced",
    type: "Achievement",
    content:
      "After a nail-biting Grand Finale, EcoRoute — an AI-powered municipal waste routing startup founded by three second-years — walked away with the top ₹1,00,000 seed grant and a spot in the SIES Incubation Center. Runner-up honors went to MedLink, a tele-consultation platform for rural clinics. Both teams also received 6 months of free co-working space. Watch this space for the incubation cohort's demo day announcement in a few months!",
    tags: ["startups", "ecell", "venturecraft", "results"],
    autoDeleteAfterMonths: 6,
  },
  {
    communityKey: "iete@campus.edu",
    title: "Techxter 2026: booth allocation deadline extended to Oct 12",
    type: "Notice",
    content:
      "Due to a high volume of last-minute registrations, we're extending the deadline for hardware booth allocation and power specification submissions to October 12th, 11:59 PM. If your team hasn't submitted your project title and hardware domain category yet, please do so through the registration form — booths are assigned on a first-come basis and we're already at 85% capacity.",
    tags: ["techxter", "iete", "expo", "deadline"],
    autoDeleteAfterMonths: 2,
  },
  {
    communityKey: "sae@campus.edu",
    title: "Our Baja buggy finishes 3rd nationally at BAJA SAE India 2026",
    type: "Achievement",
    content:
      "Team SAE SIES GST is thrilled to share that our off-road buggy 'Vanguard' placed 3rd overall out of 120+ teams at BAJA SAE India 2026, and took 1st place in the Endurance Run category. Massive credit to the powertrain and suspension sub-teams who redesigned the CVT tuning just three weeks before the event. Come see Vanguard up close at our next open garage session — details to follow.",
    tags: ["baja", "sae", "automotive", "achievement"],
    autoDeleteAfterMonths: 8,
  },
  {
    communityKey: "literaryclub@campus.edu",
    title: "Gravitas '26 schedule is live — debate motions drop Oct 10",
    type: "Event",
    content:
      "The full day schedule for Gravitas '26 is now up: Asian Parliamentary Debate prelims kick off at 11 AM in the Library Discussion Hall, followed by the Sunset Spoken Word Slam at 3 PM in the Open Amphitheatre. Debate motions will be released on October 10th so teams can start prepping case files. If you're competing in both events, your rounds have been scheduled with a buffer — check your registered email for your exact slot.",
    tags: ["gravitas", "debate", "poetry", "literary"],
    autoDeleteAfterMonths: 3,
  },
  {
    communityKey: "aarambh@campus.edu",
    title: "Open auditions for Rangmanch street play troupes start Monday",
    type: "Announcement",
    content:
      "Calling all actors, writers, and street performers! Open auditions for this year's Nukkad Natak troupes begin Monday at 4 PM in the Main Auditorium Green Room. No prior theatre experience needed — we're looking for strong voice projection, stage presence, and a willingness to improvise. Bring an original 1-minute monologue on any social issue that matters to you. Troupe formations and script-writing sessions begin the following week.",
    tags: ["theatre", "auditions", "rangmanch", "aarambh"],
    autoDeleteAfterMonths: 2,
  },
  {
    communityKey: "moksh@campus.edu",
    title: "Open practice sessions before StepUp '26 — all skill levels welcome",
    type: "Update",
    content:
      "With StepUp '26 approaching, Moksh is opening up our regular practice sessions to anyone who wants to join a team or just improve their moves. We'll be running open floor sessions every Wednesday and Friday evening in the Student Activity Center dance studio, covering hip-hop fundamentals, popping/locking basics, and group formation work. No auditions required to attend — just show up in comfortable shoes.",
    tags: ["dance", "moksh", "stepup", "practice"],
    autoDeleteAfterMonths: 3,
  },
];

const COMMENT_POOL = [
  "This is amazing, congrats to everyone involved!",
  "Can't wait, count me in!",
  "So proud of this team, well deserved 🙌",
  "Do we need to register separately or is this automatic for existing members?",
  "Great initiative, more of this please!",
  "Just registered, looking forward to it!",
  "Where can I find more details about this?",
  "This made my day, congratulations!",
  "Solid work, respect to everyone who put in the effort.",
  "Is there a recording/writeup for those who couldn't attend?",
];

async function seedPosts() {
  try {
    console.log("Connecting to MongoDB at:", dbUrl);
    await mongoose.connect(dbUrl);
    console.log("Connected successfully.\n");

    const communities = await Community.find({}).lean();
    if (communities.length === 0) {
      throw new Error("No communities found. Run `npm run seed:communities` first.");
    }
    const communityMap = new Map(communities.map((c) => [c.email.toLowerCase(), c]));

    const students = await User.find({}).lean();
    if (students.length === 0) {
      throw new Error("No students found. Run `npm run seed:students` first.");
    }

    // Clear posts we previously seeded (and their likes/comments) to keep this idempotent.
    const oldPosts = await Post.find({ title: { $in: POSTS_DATA.map((p) => p.title) } }).select("_id").lean();
    if (oldPosts.length > 0) {
      const oldPostIds = oldPosts.map((p) => p._id);
      await Like.deleteMany({ target: { $in: oldPostIds }, targetType: "Post" });
      await Comment.deleteMany({ post: { $in: oldPostIds } });
      await Post.deleteMany({ _id: { $in: oldPostIds } });
      console.log(`Cleared ${oldPosts.length} previously seeded posts.`);
    }

    console.log(`\nSeeding ${POSTS_DATA.length} posts...`);

    let totalLikes = 0;
    let totalComments = 0;

    for (const data of POSTS_DATA) {
      const community = communityMap.get(data.communityKey.toLowerCase());
      if (!community) {
        console.log(` Skipping "${data.title}" — community ${data.communityKey} not found.`);
        continue;
      }

      const post = new Post({
        community: community._id,
        title: data.title,
        content: data.content,
        type: data.type,
        tags: data.tags,
        autoDeleteAfterMonths: data.autoDeleteAfterMonths,
        isPublished: true,
      });
      await post.save();

      // ── Likes ──
      const likeCount = Math.floor(Math.random() * 30) + 10;
      const likeStudents = [...students].sort(() => 0.5 - Math.random()).slice(0, likeCount);
      for (const student of likeStudents) {
        try {
          await new Like({
            student: student._id,
            target: post._id,
            targetType: "Post",
            isActive: true,
          }).save();
          totalLikes++;
        } catch {
          // ignore duplicate key race
        }
      }

      // ── Comments ──
      const commentCount = Math.floor(Math.random() * 3) + 2; // 2-4
      const commentStudents = [...students].sort(() => 0.5 - Math.random()).slice(0, commentCount);
      for (const student of commentStudents) {
        const text = COMMENT_POOL[Math.floor(Math.random() * COMMENT_POOL.length)];
        await new Comment({
          student: student._id,
          post: post._id,
          content: text,
        }).save();
        totalComments++;
      }

      console.log(` [${data.type.padEnd(11)}] ${data.title.slice(0, 55).padEnd(55)} | Likes: ${likeStudents.length} | Comments: ${commentCount}`);
    }

    console.log(`\n======================================================`);
    console.log(` POST SEEDING COMPLETED SUCCESSFULLY`);
    console.log(`======================================================`);
    console.log(`Total Posts created:    ${POSTS_DATA.length}`);
    console.log(`Total Likes created:    ${totalLikes}`);
    console.log(`Total Comments created: ${totalComments}`);
    console.log(`======================================================\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding posts:", err);
    process.exit(1);
  }
}

seedPosts();
