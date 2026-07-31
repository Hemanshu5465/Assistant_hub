require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("Attempting to generate content with gemini-1.5-flash...");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log("Success! Response:", result.response.text());
    } catch (err) {
        console.error("DEBUG ERROR STATUS:", err.status);
        console.error("DEBUG ERROR MESSAGE:", err.message);
        if (err.response) {
            console.error("DEBUG RESPONSE:", JSON.stringify(err.response, null, 2));
        }
    }
}

listModels();
