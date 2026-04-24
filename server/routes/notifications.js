const express = require("express");
const router = express.Router();
const {
    getNotifications, getUnreadCount, markAllRead, markOneRead, deleteNotification
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getNotifications);
router.get("/unread", protect, getUnreadCount);
router.put("/read-all", protect, markAllRead);
router.put("/:id/read", protect, markOneRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;