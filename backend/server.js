require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

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

// Routes are required BEFORE connectDB() runs. This registers every
// Sequelize model (User, FormEntry) with the sequelize instance first,
// so that sequelize.sync() (inside connectDB) actually has models to
// create tables for. If this order were reversed, sync() would run
// against zero registered models and no tables would ever be created.
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/form", require("./routes/form.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

// Connect to Postgres (and sync models) before accepting traffic.
connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT} (0.0.0.0)`));
});
