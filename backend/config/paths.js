const os = require("os");
const path = require("path");
const fs = require("fs");

// Where multer writes uploaded files.
//  - Local/normal server: <backend>/uploads  (persists on disk)
//  - Vercel serverless:    /tmp/uploads       (writable, but ephemeral)
const uploadRoot = process.env.VERCEL
    ? path.join(os.tmpdir(), "uploads")
    : path.join(__dirname, "..", "uploads");

try {
    fs.mkdirSync(uploadRoot, { recursive: true });
} catch (e) {
    // read-only FS or race - safe to ignore
}

module.exports = { uploadRoot };
