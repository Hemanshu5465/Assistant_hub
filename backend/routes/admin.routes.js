const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FormEntry = require("../models/FormEntry");

// --- USERS ---

// Get all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.findAll({ order: [["createdAt", "DESC"]] });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user
router.put("/users/:id", async (req, res) => {
    try {
        await User.update(req.body, { where: { id: req.params.id } });
        const updated = await User.findByPk(req.params.id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- FORMS ---

// Get all forms
router.get("/forms", async (req, res) => {
    try {
        const forms = await FormEntry.findAll({ order: [["submittedAt", "DESC"]] });
        res.json(forms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete form
router.delete("/forms/:id", async (req, res) => {
    try {
        await FormEntry.destroy({ where: { id: req.params.id } });
        res.json({ message: "Entry deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update form
router.put("/forms/:id", async (req, res) => {
    try {
        await FormEntry.update(req.body, { where: { id: req.params.id } });
        const updated = await FormEntry.findByPk(req.params.id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
