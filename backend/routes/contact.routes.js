const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Email Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // System email
        pass: process.env.EMAIL_PASS
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const mailOptions = {
            to: "aihub2804@gmail.com", // Destination email
            from: process.env.EMAIL_USER,
            subject: `New Contact Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Contact Email Error:", err);
                return res.status(500).json({ message: "Error sending message" });
            }
            res.json({ message: "Message sent successfully" });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
