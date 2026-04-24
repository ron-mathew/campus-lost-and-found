const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "claim_submitted",   // item owner gets this
                "claim_approved",    // claimer gets this
                "claim_rejected",    // claimer gets this
                "item_returned",     // claimer gets this
                "new_message",       // recipient gets this
            ],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String, // e.g. /items/:id or /messages/:chatId
            default: "",
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);