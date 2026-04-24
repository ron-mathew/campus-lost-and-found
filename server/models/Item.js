const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: [true, "Item type (lost/found) is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: [
        "electronics",
        "clothing",
        "accessories",
        "books",
        "documents",
        "keys",
        "wallet",
        "other",
      ],
      required: [true, "Category is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "claimed", "returned"],
      default: "open",
    },
    dateLostOrFound: {
      type: Date,
      required: [true, "Date lost or found is required"],
    },
  },
  { timestamps: true }
);

// Index for efficient search/filter queries
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ title: "text", description: "text" }); // full-text search

module.exports = mongoose.model("Item", itemSchema);
