const Claim = require("../models/Claim");
const Item = require("../models/Item");
const Chat = require("../models/Chat");
const Notification = require("../models/Notification");

// Helper to create + emit notification
const notify = async (io, { recipient, type, message, link }) => {
    const notif = await Notification.create({ recipient, type, message, link });
    io?.to(recipient.toString()).emit("new_notification", notif);
    return notif;
};

module.exports = (io) => {
    const createClaim = async (req, res, next) => {
        try {
            const { itemId, message } = req.body;
            const item = await Item.findById(itemId).populate("postedBy", "name");
            if (!item) { res.status(404); throw new Error("Item not found"); }
            if (item.status !== "open") { res.status(400); throw new Error("Item already claimed"); }
            if (item.postedBy._id.toString() === req.user._id.toString()) { res.status(400); throw new Error("Cannot claim your own item"); }

            const claim = await Claim.create({ itemId, claimedBy: req.user._id, message });

            // Notify item owner
            await notify(io, {
                recipient: item.postedBy._id,
                type: "claim_submitted",
                message: `${req.user.name} submitted a claim on your item "${item.title}"`,
                link: `/items/${itemId}`,
            });

            res.status(201).json(claim);
        } catch (err) { next(err); }
    };

    const getClaimsForItem = async (req, res, next) => {
        try {
            const item = await Item.findById(req.params.itemId);
            if (!item) { res.status(404); throw new Error("Item not found"); }
            if (item.postedBy.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Not authorised"); }
            const claims = await Claim.find({ itemId: req.params.itemId }).populate("claimedBy", "name email prn");
            res.json(claims);
        } catch (err) { next(err); }
    };

    const getMyClaims = async (req, res, next) => {
        try {
            const claims = await Claim.find({ claimedBy: req.user._id }).populate("itemId", "title type status location");
            res.json(claims);
        } catch (err) { next(err); }
    };

    const updateClaimStatus = async (req, res, next) => {
        try {
            const { status } = req.body;
            const claim = await Claim.findById(req.params.id).populate("itemId");
            if (!claim) { res.status(404); throw new Error("Claim not found"); }
            if (claim.itemId.postedBy.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Not authorised"); }

            claim.status = status;
            await claim.save();

            if (status === "approved") {
                await Item.findByIdAndUpdate(claim.itemId._id, { status: "claimed" });

                // Create chat
                const existingChat = await Chat.findOne({
                    item: claim.itemId._id,
                    participants: { $all: [req.user._id, claim.claimedBy] },
                });
                const chat = existingChat || await Chat.create({
                    item: claim.itemId._id,
                    participants: [req.user._id, claim.claimedBy],
                    lastMessage: "Claim approved — you can now chat!",
                });

                // Notify claimer
                await notify(io, {
                    recipient: claim.claimedBy,
                    type: "claim_approved",
                    message: `Your claim on "${claim.itemId.title}" was approved! You can now chat with the owner.`,
                    link: `/messages/${chat._id}`,
                });

            } else if (status === "rejected") {
                // Notify claimer
                await notify(io, {
                    recipient: claim.claimedBy,
                    type: "claim_rejected",
                    message: `Your claim on "${claim.itemId.title}" was not approved.`,
                    link: `/items/${claim.itemId._id}`,
                });
            }

            res.json(claim);
        } catch (err) { next(err); }
    };

    return { createClaim, getClaimsForItem, getMyClaims, updateClaimStatus };
};