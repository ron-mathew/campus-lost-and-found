const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, "Message cannot exceed 300 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One claim per user per item
claimSchema.index({ itemId: 1, claimedBy: 1 }, { unique: true });

module.exports = mongoose.model("Claim", claimSchema);
