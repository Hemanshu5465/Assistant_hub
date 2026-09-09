// Local / long-running server entry point.
// (On Vercel the app is served from /api/index.js instead.)
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () =>
            console.log(`Server running on port ${PORT} (0.0.0.0)`)
        );
    })
    .catch((err) => {
        console.error("Startup failed:", err.message);
        process.exit(1);
    });
