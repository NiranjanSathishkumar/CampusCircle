// Reading in-app notifications (models/Notification.js).
// List newest-first, unread badge count, mark one / all read.
// Creating them belongs in services/notification.service.js - writes are
// triggered by other features, never by a route here.
// Documents self-expire after 30 days via a TTL index.
// Recipient is polymorphic (User for students, Community for organizers) -
// every query below is scoped by both recipient id AND recipientType so a
// student and an organizer can never read each other's notifications even
// in the (astronomically unlikely) case their ids collided.
const Notification = require("../../models/Notification");
// Ensure polymorphic models are registered for populate
require("../../models/User");
require("../../models/Community");
require("../../models/Post");
require("../../models/Event");
require("../../models/CommunityRecruitment");
require("../../models/Registration");
require("../../models/CommunityMembership");
require("../../models/TeamMember");
require("../../models/CommunityApplication");

const NOTIFICATION_POPULATE = [
    { path: "actor", select: "name profilePicture" },
    {
        path: "target",
        select: "-password -refreshTokens -passwordResetTokenHash -passwordResetExpires -rollNo -prnNo -email",
        strictPopulate: false,
        populate: [
            { path: "community", select: "name logo", strictPopulate: false },
            {
                path: "event",
                select: "title eventDate venue community",
                strictPopulate: false,
                populate: { path: "community", select: "name logo", strictPopulate: false },
            },
            { path: "recruitment", select: "title community", strictPopulate: false },
        ],
    },
];

// req.role is "student" or "organizer" - maps to the recipientType a
// notification for this account would have been created with.
const recipientTypeFor = (role) => (role === "organizer" ? "Community" : "User");

module.exports.listNotifications = async (req, res) => {
    const account = req.user;
    const recipientType = recipientTypeFor(req.role);
    const { page, limit, unreadOnly, type } = req.query;

    const filter = { recipient: account._id, recipientType };
    if (unreadOnly) filter.isRead = false;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
        Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate(NOTIFICATION_POPULATE),
        Notification.countDocuments(filter),
    ]);

    return res.status(200).json({
        success: true,
        notifications,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
};

module.exports.getUnreadCount = async (req, res) => {
    const account = req.user;
    const recipientType = recipientTypeFor(req.role);
    const count = await Notification.countDocuments({ recipient: account._id, recipientType, isRead: false });
    return res.status(200).json({ success: true, count });
};

module.exports.markAsRead = async (req, res) => {
    const account = req.user;
    const recipientType = recipientTypeFor(req.role);
    const { notificationId } = req.params;

    const notification = await Notification.findOne({ _id: notificationId, recipient: account._id, recipientType });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
    }

    await notification.populate(NOTIFICATION_POPULATE);

    return res.status(200).json({ success: true, message: "Notification marked as read", notification });
};

module.exports.markAllAsRead = async (req, res) => {
    const account = req.user;
    const recipientType = recipientTypeFor(req.role);

    await Notification.updateMany(
        { recipient: account._id, recipientType, isRead: false },
        { $set: { isRead: true, readAt: new Date() } },
    );

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
};

module.exports.deleteNotification = async (req, res) => {
    const account = req.user;
    const recipientType = recipientTypeFor(req.role);
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: account._id, recipientType });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    return res.status(200).json({ success: true, message: "Notification deleted" });
};

module.exports.clearReadNotifications = async (req, res) => {
    const account = req.user;
    const recipientType = recipientTypeFor(req.role);

    await Notification.deleteMany({ recipient: account._id, recipientType, isRead: true });

    return res.status(200).json({ success: true, message: "Read notifications cleared" });
};
