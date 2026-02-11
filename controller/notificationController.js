const Notifications = require("../model/notificationModel");

// Get notifications for logged in user
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notifications.find({ recipient: req.user.id })
            .populate("sender", "name")
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notifications.findOneAndUpdate(
            { _id: id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        res.status(200).json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating notification" });
    }
};

// Clear all notifications
exports.clearNotifications = async (req, res) => {
    try {
        await Notifications.deleteMany({ recipient: req.user.id });
        res.status(200).json({ message: "Notifications cleared" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error clearing notifications" });
    }
};

// Helper function to create notification (internal use)
exports.createNotification = async (data) => {
    try {
        const notification = new Notifications(data);
        await notification.save();
        return notification;
    } catch (err) {
        console.error("Internal Notification Error:", err);
    }
};
