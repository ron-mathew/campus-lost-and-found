const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    prn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (plainText) {
  return bcrypt.compare(plainText, this.passwordHash);
};

// Never expose passwordHash in responses
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
