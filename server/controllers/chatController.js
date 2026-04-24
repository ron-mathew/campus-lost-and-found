const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Claim = require("../models/Claim");
const Item = require("../models/Item");

// GET /api/chats  — all chats for logged in user
const getMyChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate("item", "title imageUrl type status")
            .populate("participants", "name email")
            .sort({ lastMessageAt: -1 });
        res.json(chats);
    } catch (err) { next(err); }
};

// GET /api/chats/:chatId/messages
const getMessages = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) { res.status(404); throw new Error("Chat not found"); }
        if (!chat.participants.map(p => p.toString()).includes(req.user._id.toString())) {
            res.status(403); throw new Error("Not authorised");
        }

        // Mark messages as read
        await Message.updateMany(
            { chat: req.params.chatId, sender: { $ne: req.user._id }, read: false },
            { read: true }
        );

        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name")
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) { next(err); }
};

// POST /api/chats/:chatId/messages
const sendMessage = async (req, res, next) => {
    try {
        const { text } = req.body;
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) { res.status(404); throw new Error("Chat not found"); }
        if (!chat.participants.map(p => p.toString()).includes(req.user._id.toString())) {
            res.status(403); throw new Error("Not authorised");
        }

        const message = await Message.create({
            chat: req.params.chatId,
            sender: req.user._id,
            text,
        });

        await Chat.findByIdAndUpdate(req.params.chatId, {
            lastMessage: text,
            lastMessageAt: new Date(),
        });

        const populated = await message.populate("sender", "name");
        res.status(201).json(populated);
    } catch (err) { next(err); }
};

// GET /api/chats/unread  — unread message count
const getUnreadCount = async (req, res, next) => {
    try {
        const chats = await Chat.find({ participants: req.user._id });
        const chatIds = chats.map(c => c._id);
        const count = await Message.countDocuments({
            chat: { $in: chatIds },
            sender: { $ne: req.user._id },
            read: false,
        });
        res.json({ count });
    } catch (err) { next(err); }
};

module.exports = { getMyChats, getMessages, sendMessage, getUnreadCount };