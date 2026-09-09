// Load backend/.env regardless of the process's working directory.
// On Vercel there is no .env file (vars are injected) and this is a no-op.
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

const app = express();

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(cors({ origin: "*" })); // Allow all origins explicitly
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req, res) => res.send("API is running..."));

// Routes. Each require() also registers its Sequelize models with the shared
// sequelize instance, so connectDB()'s sync() has models to work with.
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/form", require("./routes/form.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/chat", require("./routes/chat.routes"));

// Uploaded files. On Vercel the only writable dir is /tmp, and files there do
// NOT persist between invocations - treat uploads as best-effort in production.
const { uploadRoot } = require("./config/paths");
app.use("/uploads", express.static(uploadRoot));

module.exports = app;
