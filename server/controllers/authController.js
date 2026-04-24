const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

const register = async (req, res, next) => {
    try {
        const { name, email, password, prn, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) { res.status(400); throw new Error("Email already registered"); }
        const user = await User.create({ name, email, passwordHash: password, prn: prn?.trim() || undefined, role });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, prn: user.prn, token: generateToken(user._id) });
    } catch (err) { next(err); }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) { res.status(401); throw new Error("Invalid email or password"); }
        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, prn: user.prn, token: generateToken(user._id) });
    } catch (err) { next(err); }
};

const getMe = async (req, res) => res.json(req.user);

// DELETE /api/auth/delete-account  (protected)
const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Delete all items and claims by this user
        await Item.deleteMany({ postedBy: userId });
        await Claim.deleteMany({ claimedBy: userId });
        await User.findByIdAndDelete(userId);

        res.json({ message: "Account deleted successfully" });
    } catch (err) { next(err); }
};

module.exports = { register, login, getMe, deleteAccount };