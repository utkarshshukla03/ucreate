"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testOpenAI = testOpenAI;
require("dotenv").config();
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || "",
});
async function testOpenAI() {
    try {
        console.log("Testing OpenAI connection...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: "Say hello in a friendly way, max 10 words.",
                },
            ],
            max_tokens: 20,
            temperature: 0.7,
        });
        const response = completion.choices[0]?.message?.content || "";
        console.log("✅ OpenAI connection successful!");
        console.log("Response:", response);
    }
    catch (error) {
        console.error("❌ OpenAI connection failed:");
        console.error(error);
    }
}
// Only run test if this file is executed directly
if (require.main === module) {
    testOpenAI();
}
