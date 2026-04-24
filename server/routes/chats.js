const express = require("express");
const router = express.Router();
const { getMyChats, getMessages, sendMessage, getUnreadCount } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getMyChats);
router.get("/unread", protect, getUnreadCount);
router.get("/:chatId/messages", protect, getMessages);
router.post("/:chatId/messages", protect, sendMessage);

module.exports = router;