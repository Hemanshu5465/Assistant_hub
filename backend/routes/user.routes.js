const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

const fs = require("fs");

// Ensure Uploads Directory Exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Update Basic Info
router.patch("/:id", async (req, res) => {
    try {
        const { name, email } = req.body;

        const [updatedCount] = await User.update(
            { name, email },
            { where: { id: req.params.id } }
        );

        if (updatedCount === 0) return res.status(404).json({ message: "User not found" });

        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ["password"] }
        });

        res.json({ message: "Profile updated", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Upload Avatar
router.post("/avatar", upload.single("avatar"), async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        await User.update({ profileImage: imageUrl }, { where: { id: userId } });

        res.json({ message: "Avatar updated", imageUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get User Info (for profile page)
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ["password"] }
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
