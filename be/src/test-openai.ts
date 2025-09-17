require("dotenv").config();
import OpenAI from "openai";

const openai = new OpenAI({
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
    
  } catch (error) {
    console.error("❌ OpenAI connection failed:");
    console.error(error);
  }
}

// Only run test if this file is executed directly
if (require.main === module) {
  testOpenAI();
}

export { testOpenAI };
