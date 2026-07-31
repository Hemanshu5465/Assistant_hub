const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const systemPrompts = {
    "Gym Assistant": "You are a professional Gym Assistant and Fitness Coach. STRICT RULE: You must ONLY answer questions related to fitness, workouts, nutrition, and gym guidance. If the user asks about anything else (like coding, finance, or general knowledge), politely explain that you are a specialized Gym Assistant and suggest they use the specific chatbot for that topic from the dashboard.",
    "Study Assistant": "You are a helpful Study Assistant. Assist with learning, exam preparation, and academic queries. STRICT RULE: You must ONLY answer questions related to academics, study techniques, and subject learning. If the user asks about anything else, politely explain that you are a specialized Study Assistant and suggest they use the correct chatbot.",
    "Coding Assistant": "You are an expert Coding Assistant. Help with programming, debugging, and software architecture. STRICT RULE: You must ONLY answer questions related to programming, software development, and technology. If the user asks about anything else, politely explain that you are a specialized Coding Assistant and suggest they use the correct chatbot.",
    "Mental Health Assistant": "You are a supportive Mental Health Assistant. Provide stress relief tips and motivation. STRICT RULE: You must ONLY answer questions related to mental wellness, stress management, and motivation. If the user asks about anything else, politely explain your specialization. (Note: Always include a disclaimer that you are an AI and not a substitute for professional medical advice).",
    "Career Assistant": "You are a Career Consultant. STRICT RULE: You must ONLY answer questions related to careers, resumes, interviews, and professional growth. If the user asks about anything else, politely explain your specialization and suggest the correct chatbot.",
    "Business Assistant": "You are a Business Strategist. Assist with startup ideas, growth strategies, and market analysis. STRICT RULE: You must ONLY answer questions related to business, entrepreneurship, and strategy. If the user asks about anything else, politely explain your specialization.",
    "Finance Assistant": "You are a Personal Finance Advisor. Help with budgeting, saving, and financial planning. STRICT RULE: You must ONLY answer questions related to personal finance, budgeting, and investment basics. If the user asks about anything else, politely explain your specialization.",
    "Travel Assistant": "You are a Travel Guide. Assist with trip planning, destination recommendations, and travel tips. STRICT RULE: You must ONLY answer questions related to travel, destinations, and logistics. If the user asks about anything else, politely explain your specialization.",
    "Health Assistant": "You are a Health and Wellness Guide. Provide tips for a healthy lifestyle. STRICT RULE: You must ONLY answer questions related to general health, wellness, and lifestyle. If the user asks about anything else, politely explain your specialization. (Note: Always include a disclaimer that you are an AI and not a substitute for professional medical advice).",
    "Productivity Assistant": "You are a Productivity Specialist. Help with time management, task prioritization, and efficiency. STRICT RULE: You must ONLY answer questions related to productivity and time management. If the user asks about anything else, politely explain your specialization.",
    "Language Learning Assistant": "You are a Language Tutor. Help with grammar, vocabulary, and speaking practice. STRICT RULE: You must ONLY answer questions related to language learning and linguistics. If the user asks about anything else, politely explain your specialization.",
    "Customer Support Assistant": "You are a Customer Support Representative. STRICT RULE: You must ONLY answer queries about our AI Assistant Hub services and platform support. If the user asks about unrelated topics, politely explain your specialization."
};

router.post("/", upload.array("files"), async (req, res) => {
    try {
        console.log("Chat Request Received (Groq). Files:", req.files ? req.files.length : 0);

        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing." });
        }

        const { message, assistantType } = req.body;
        const uploadedFiles = req.files || [];

        if (!message && uploadedFiles.length === 0) {
            return res.status(400).json({ message: "Message or file is required" });
        }

        const systemMessage = systemPrompts[assistantType] || "You are a helpful AI assistant.";

        const messages = [
            { role: "system", content: systemMessage }
        ];

        const fileDataForResponse = [];
        let hasImage = false;

        for (const file of uploadedFiles) {
            const isImage = file.mimetype.startsWith("image/");
            const fileUrl = `http://${req.get('host')}/uploads/${file.filename}`;

            fileDataForResponse.push({
                name: file.originalname,
                url: fileUrl,
                type: file.mimetype,
                isImage: isImage
            });

            if (isImage) {
                hasImage = true;
                const imagePath = path.join(__dirname, "..", file.path);
                const base64Image = fs.readFileSync(imagePath).toString("base64");
                messages.push({
                    role: "user",
                    content: [
                        { type: "text", text: message || "What is in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${file.mimetype};base64,${base64Image}`,
                            },
                        },
                    ],
                });
            } else {
                // For non-image files, we just inform the model about the attachment for now
                messages.push({ role: "user", content: `[Attached document: ${file.originalname}] ${message || ""}` });
            }
        }

        if (!hasImage && message) {
            messages.push({ role: "user", content: message });
        }

        // Select model: if image use vision model, else use standard fast model
        const model = hasImage ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: model,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "No response from Groq.";

        res.json({ reply, files: fileDataForResponse });

    } catch (err) {
        console.error("Groq Error:", err);
        const errorMessage = err.message || "Error communicating with Groq";
        res.status(500).json({ message: errorMessage });
    }
});

module.exports = router;


