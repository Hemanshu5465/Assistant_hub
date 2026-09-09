// Vercel serverless entry point for the Express backend.
// Vercel routes /api/* and /uploads/* here (see vercel.json); the Express
// app then matches the full path (e.g. /api/auth/login) itself.
const app = require("../backend/app");
const { connectDB } = require("../backend/config/db");

module.exports = async (req, res) => {
    try {
        await connectDB();
    } catch (err) {
        console.error("DB connection failed:", err.message);
        return res.status(503).json({ message: "Database unavailable" });
    }
    return app(req, res);
};
