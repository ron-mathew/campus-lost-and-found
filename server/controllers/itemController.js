const Item = require("../models/Item");

const getItems = async (req, res, next) => {
    try {
        const { type, category, location, status, search } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (location) filter.location = new RegExp(location, "i");
        if (status) filter.status = status;
        if (search) filter.$text = { $search: search };
        const items = await Item.find(filter).populate("postedBy", "name email").sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { next(err); }
};

const getItemById = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id).populate("postedBy", "name email");
        if (!item) { res.status(404); throw new Error("Item not found"); }
        res.json(item);
    } catch (err) { next(err); }
};

const createItem = async (req, res, next) => {
    try {
        const { type, title, description, category, location, imageUrl, dateLostOrFound } = req.body;
        const item = await Item.create({ postedBy: req.user._id, type, title, description, category, location, imageUrl, dateLostOrFound });
        res.status(201).json(item);
    } catch (err) { next(err); }
};

const updateItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) { res.status(404); throw new Error("Item not found"); }
        if (item.postedBy.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Not authorised"); }
        const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(updated);
    } catch (err) { next(err); }
};

const deleteItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) { res.status(404); throw new Error("Item not found"); }
        if (item.postedBy.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Not authorised"); }
        await item.deleteOne();
        res.json({ message: "Item removed" });
    } catch (err) { next(err); }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem };