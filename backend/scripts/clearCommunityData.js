const mongoose = require("mongoose");
require("dotenv").config();

const Community = require("../src/models/Community");
const CommunityMembership = require("../src/models/CommunityMembership");
const CommunityRecruitment = require("../src/models/CommunityRecruitment");
const CommunityApplication = require("../src/models/CommunityApplication");
const Event = require("../src/models/Event");
const Registration = require("../src/models/Registration");
const TeamMember = require("../src/models/TeamMember");
const Bookmark = require("../src/models/Bookmark");
const Post = require("../src/models/Post");
const Comment = require("../src/models/Comment");
const Like = require("../src/models/Like");
const Follow = require("../src/models/Follow");
const EmailRegistry = require("../src/models/EmailRegistry");
const AuditLog = require("../src/models/AuditLog");
const Notification = require("../src/models/Notification");
const { User } = require("../src/models/User");

const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || "mongodb://127.0.0.1:27017/campuscircle";

async function clearCommunityData() {
  try {
    console.log("Connecting to database at:", dbUrl);
    await mongoose.connect(dbUrl);
    console.log("Connected successfully.\n");

    // 1. Gather all community IDs before deletion
    const communities = await Community.find({}).select("_id name email").lean();
    const communityIds = communities.map((c) => c._id);
    const communityEmails = communities.map((c) => c.email.toLowerCase());

    console.log(`Found ${communities.length} community account(s):`);
    communities.forEach((c) => console.log(` - ${c.name} (${c.email}) [ID: ${c._id}]`));
    console.log("");

    // 2. Count existing records before deletion
    const counts = {
      communities: communities.length,
      memberships: await CommunityMembership.countDocuments({}),
      recruitments: await CommunityRecruitment.countDocuments({}),
      applications: await CommunityApplication.countDocuments({}),
      events: await Event.countDocuments({}),
      registrations: await Registration.countDocuments({}),
      teamMembers: await TeamMember.countDocuments({}),
      bookmarks: await Bookmark.countDocuments({}),
      posts: await Post.countDocuments({}),
      comments: await Comment.countDocuments({}),
      likes: await Like.countDocuments({ targetType: { $in: ["Post", "Event"] } }),
      communityFollows: await Follow.countDocuments({ followingType: "Community" }),
      organizerEmailRegistry: await EmailRegistry.countDocuments({
        $or: [{ role: "organizer" }, { email: { $in: communityEmails } }],
      }),
      auditLogs: await AuditLog.countDocuments({}),
      communityNotifications: await Notification.countDocuments({
        $or: [
          { targetType: { $in: ["Post", "Event", "CommunityRecruitment", "CommunityMembership", "Registration", "TeamMember"] } },
          { type: { $in: [
            "community_post",
            "community_event",
            "community_recruitment",
            "role_promotion",
            "event_updated",
            "event_reminder",
            "waitlist_promotion",
            "team_invite",
            "team_invite_accepted",
            "team_invite_declined",
          ] } },
        ],
      }),
    };

    console.log("--- Items to be deleted ---");
    console.table(counts);

    // 3. Perform deletions
    console.log("\nDeleting records...");

    const delMemberships = await CommunityMembership.deleteMany({});
    const delRecruitments = await CommunityRecruitment.deleteMany({});
    const delApplications = await CommunityApplication.deleteMany({});
    const delEvents = await Event.deleteMany({});
    const delRegistrations = await Registration.deleteMany({});
    const delTeamMembers = await TeamMember.deleteMany({});
    const delBookmarks = await Bookmark.deleteMany({});
    const delPosts = await Post.deleteMany({});
    const delComments = await Comment.deleteMany({});
    const delLikes = await Like.deleteMany({ targetType: { $in: ["Post", "Event"] } });
    const delFollows = await Follow.deleteMany({
      $or: [
        { followingType: "Community" },
        { following: { $in: communityIds } },
      ],
    });
    const delEmailRegistry = await EmailRegistry.deleteMany({
      $or: [{ role: "organizer" }, { email: { $in: communityEmails } }],
    });
    const delAuditLogs = await AuditLog.deleteMany({});
    const delNotifications = await Notification.deleteMany({
      $or: [
        { targetType: { $in: ["Post", "Event", "CommunityRecruitment", "CommunityMembership", "Registration", "TeamMember"] } },
        { type: { $in: [
          "community_post",
          "community_event",
          "community_recruitment",
          "role_promotion",
          "event_updated",
          "event_reminder",
          "waitlist_promotion",
          "team_invite",
          "team_invite_accepted",
          "team_invite_declined",
        ] } },
      ],
    });
    const delCommunities = await Community.deleteMany({});

    // 4. Recalculate and synchronize User following counts (to ensure no dangling community counts)
    console.log("Recalculating user followingCount...");
    const users = await User.find({}).select("_id");
    for (const u of users) {
      const activeFollowsCount = await Follow.countDocuments({
        follower: u._id,
        followingType: "User",
        isActive: true,
      });
      await User.updateOne({ _id: u._id }, { $set: { followingCount: activeFollowsCount } });
    }

    console.log("\nCommunity data purge completed successfully!");
    console.log(`- Communities deleted: ${delCommunities.deletedCount}`);
    console.log(`- Memberships deleted: ${delMemberships.deletedCount}`);
    console.log(`- Recruitment drives deleted: ${delRecruitments.deletedCount}`);
    console.log(`- Applications deleted: ${delApplications.deletedCount}`);
    console.log(`- Events deleted: ${delEvents.deletedCount}`);
    console.log(`- Event Registrations deleted: ${delRegistrations.deletedCount}`);
    console.log(`- Team Members deleted: ${delTeamMembers.deletedCount}`);
    console.log(`- Event Bookmarks deleted: ${delBookmarks.deletedCount}`);
    console.log(`- Posts deleted: ${delPosts.deletedCount}`);
    console.log(`- Comments deleted: ${delComments.deletedCount}`);
    console.log(`- Likes deleted: ${delLikes.deletedCount}`);
    console.log(`- Community Follows deleted: ${delFollows.deletedCount}`);
    console.log(`- EmailRegistry organizer records deleted: ${delEmailRegistry.deletedCount}`);
    console.log(`- Audit Logs deleted: ${delAuditLogs.deletedCount}`);
    console.log(`- Community Notifications deleted: ${delNotifications.deletedCount}`);
    console.log(`- Student accounts preserved and following counts synchronized.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error purging community data:", err);
    process.exit(1);
  }
}

clearCommunityData();
