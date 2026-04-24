const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        lastMessage: {
            type: String,
            default: "",
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// One chat per item per claim (no duplicates)
chatSchema.index({ item: 1, participants: 1 }, { unique: true });

module.exports = mongoose.model("Chat", chatSchema);