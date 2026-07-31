const express = require("express");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const User = require("../models/User.js");
const FormEntry = require("../models/FormEntry");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash });

    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for Admin
    if (email === "admin@gmail.com" && password === "Admin@123") {
      return res.json({
        message: "Admin Login Successful",
        user: { name: "Administrator", email: email, role: "admin" }
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user (no password for Google users)
      user = await User.create({
        name,
        email,
        password: null
      });
    }

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name }
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(400).json({ message: "Google Sign-In failed" });
  }
});

// Get User Usage Stats
router.get("/:id/usage", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || userId === "undefined" || isNaN(parseInt(userId, 10))) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Count form entries by assistant type for this user
    const usageRows = await FormEntry.findAll({
      where: { userId },
      attributes: [
        "assistant",
        [FormEntry.sequelize.fn("COUNT", FormEntry.sequelize.col("assistant")), "count"]
      ],
      group: ["assistant"]
    });

    // Fetch user basic info
    const user = await User.findByPk(userId, {
      attributes: ["name", "email", "createdAt"]
    });

    const usage = usageRows.reduce((acc, row) => {
      acc[row.assistant] = parseInt(row.get("count"), 10);
      return acc;
    }, {});

    res.json({ user, usage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate Token
    const token = crypto.randomBytes(20).toString("hex");

    // Save Token to User
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 Hour
    await user.save();

    // Send Email
    const resetUrl = `http://127.0.0.1:5500/forms/reset.html?token=${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `${resetUrl}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Email Error (Nodemailer):", err);
        return res.status(500).json({ message: "Error sending email. Check server logs." });
      }
      res.json({ message: "Email sent" });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired" });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
