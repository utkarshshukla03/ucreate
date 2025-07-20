require("dotenv").config();
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    // Add other safety settings as required
  ],
});

// ------------------- TEMPLATE ROUTE -------------------
app.post("/template", async (req, res) => {
  const prompt = req.body?.prompt;
  if (!prompt) return res.status(400).json({ message: "Missing prompt in body", uiPrompts: [] });

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Reply with only one word: 'react' or 'node'. Do not explain. Do not add anything else. If the project is a frontend, reply 'react'. If backend, reply 'node'.\n\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 8000 },
    });

    const output = result.response.text().trim().toLowerCase();
    console.log("Gemini model answered:", output);
 
    if (output === "react") {
      const templatePrompts = [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ];
      return res.json({ prompts: templatePrompts, uiPrompts: [reactBasePrompt, templatePrompts[1]] });
    }
  
    if (output === "node") {
      return res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
    }
  
    return res.status(403).json({ message: "Invalid model response", modelResponse: output, uiPrompts: [] });
  } catch (err: any) {
    console.error("Gemini /template error:", err);
    
    // Handle rate limiting specifically
    if (err.status === 429 || (err.response && err.response.status === 429)) {
      return res.status(429).json({ 
        message: "API_RATE_LIMIT_EXCEEDED", 
        userMessage: "Too many requests right now. Please wait a while and try again.",
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ], 
        uiPrompts: [reactBasePrompt] 
      });
    }
    
    return res.status(500).json({ message: "Gemini API call failed", error: err, uiPrompts: [] });
  }
});

// ------------------- CHAT ROUTE -------------------
app.post("/chat", async (req, res) => {
  const messages = req.body?.messages;
  if (!Array.isArray(messages)) {
    return res.status(400).json({
      message: "Invalid messages format.",
      uiPrompts: [`<boltArtifact id="initial-setup" title="Project Setup">
        <boltAction type="file" filePath="/src/App.tsx">
          export default function App() {
            return (
              <div>Loading...</div>
            );
          }
        </boltAction>
      </boltArtifact>`],
    });
  }

  try {
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: getSystemPrompt() }],
        },
        ...formattedMessages,
      ],
      generationConfig: { maxOutputTokens: 2500 },
    });

    const content = result.response.text();
    console.log("Gemini chat response:", content);

    if (!content || (!content.includes("<boltArtifact") && !content.includes("```"))) {
      return res.status(400).json({
        message: "Invalid response format from Gemini - no XML or code blocks found",
        error: "Invalid format",
        uiPrompts: [`<boltArtifact id="initial-setup" title="Waiting for Response">
          <boltAction type="file" filePath="/src/App.tsx">
            export default function App() {
              return (
                <div className="flex min-h-screen items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Initializing Project</h1>
                    <p className="text-gray-600">Waiting for Gemini response...</p>
                  </div>
                </div>
              );
            }
          </boltAction>
        </boltArtifact>`],
      });
    }

    res.json({ response: content, uiPrompts: [content] });
  } catch (err: any) {
    console.error("Gemini /chat error:", err);
    
    // Handle rate limiting specifically
    if (err.status === 429 || (err.response && err.response.status === 429)) {
      return res.status(429).json({
        message: "API_RATE_LIMIT_EXCEEDED",
        userMessage: "Too many requests right now. Please wait a while and try again.",
        response: `<boltArtifact id="rate-limit-fallback" title="Rate Limit Reached">
          <boltAction type="file" filePath="/src/App.tsx">
            import React from 'react';
            import './App.css';

            function App() {
              return (
                <div className="App">
                  <header className="App-header">
                    <h1>My Portfolio</h1>
                    <p>Welcome to my personal website!</p>
                  </header>
                  <main>
                    <p>API rate limit reached. Please wait and try again.</p>
                  </main>
                </div>
              );
            }

            export default App;
          </boltAction>
        </boltArtifact>`,
        uiPrompts: [`<boltArtifact id="rate-limit-fallback" title="Portfolio Website (Rate Limited)">
          <boltAction type="file" filePath="/src/App.tsx">
            import React from 'react';
            import './App.css';

            function App() {
              return (
                <div className="App">
                  <header className="App-header">
                    <h1>My Portfolio</h1>
                    <p>Welcome to my personal website!</p>
                  </header>
                  <main>
                    <p>API rate limit reached. Please wait and try again.</p>
                  </main>
                </div>
              );
            }

            export default App;
          </boltAction>
        </boltArtifact>`]
      });
    }
    
    return res.status(500).json({
      message: "Gemini chat API failed",
      error: err,
      uiPrompts: [`<boltArtifact id="initial-setup" title="API Connection Error">
        <boltAction type="file" filePath="/src/App.tsx">
          export default function App() {
            return (
              <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h1>
                  <p className="text-gray-600">Unable to connect to the Gemini API. Please try again.</p>
                </div>
              </div>
            );
          }
        </boltAction>
      </boltArtifact>`],
    });
  }
});

app.listen(3002, () => {
  console.log("✅ Server running on http://localhost:3000");
});


