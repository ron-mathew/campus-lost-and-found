const Notification = require("../models/Notification");

// GET /api/notifications
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) { next(err); }
};

// GET /api/notifications/unread
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
        res.json({ count });
    } catch (err) { next(err); }
};

// PUT /api/notifications/read-all
const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ message: "All marked as read" });
    } catch (err) { next(err); }
};

// PUT /api/notifications/:id/read
const markOneRead = async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: "Marked as read" });
    } catch (err) { next(err); }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { next(err); }
};

module.exports = { getNotifications, getUnreadCount, markAllRead, markOneRead, deleteNotification };