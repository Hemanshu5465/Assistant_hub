require("dotenv").config({ path: __dirname + "/.env" });
const Groq = require("groq-sdk");

async function testGroq() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === "YOUR_GROQ_API_KEY_HERE") {
        console.error("Error: Please provide a valid GROQ_API_KEY in the .env file.");
        process.exit(1);
    }

    const groq = new Groq({ apiKey });

    try {
        console.log("Testing Groq API connection...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Hello, who are you?" }
            ],
            model: "llama-3.3-70b-versatile",
        });

        console.log("Groq Response:");
        console.log(chatCompletion.choices[0]?.message?.content);
        console.log("\nSuccess: Groq API is working correctly!");
    } catch (error) {
        console.error("Groq API Error:", error.message);
    }
}

testGroq();
