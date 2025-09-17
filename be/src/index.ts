require("dotenv").config();
import express from "express";
import cors from "cors";
import axios from "axios";

import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";

const app = express();
app.use(cors());
app.use(express.json());

// GitHub Models API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_API_BASE = "https://models.inference.ai.azure.com";

// Function to call GitHub Models API
async function callGitHubModel(messages: any[], maxTokens: number = 1500) {
  try {
    const response = await axios.post(
      `${GITHUB_API_BASE}/chat/completions`,
      {
        model: "gpt-4o-mini", // GitHub Models supports this
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("GitHub Models API error:", error);
    throw error;
  }
}

// Simple delay function to help with rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Request counter for basic rate limiting awareness
let requestCount = 0;
const resetRequestCount = () => {
  requestCount = 0;
  console.log("🔄 Request counter reset");
};

// Reset counter every minute
setInterval(resetRequestCount, 60000);

// ------------------- TEMPLATE ROUTE -------------------
app.post("/template", async (req, res) => {
  const prompt = req.body?.prompt;
  if (!prompt) return res.status(400).json({ message: "Missing prompt in body", uiPrompts: [] });

  try {
    requestCount++;
    console.log(`📡 Template request #${requestCount} - Processing...`);
    
    // Add small delay if we've made multiple requests recently
    if (requestCount > 3) {
      console.log("⏱️  Adding delay to prevent rate limiting...");
      await delay(1000);
    }

    const completion = await callGitHubModel([
      {
        role: "user",
        content: `Reply with only one word: 'react' or 'node'. Do not explain. Do not add anything else. If the project is a frontend, reply 'react'. If backend, reply 'node'.\n\n${prompt}`,
      },
    ], 10);

    const output = completion.choices[0]?.message?.content?.trim().toLowerCase() || "";
    const tokensUsed = completion.usage?.total_tokens || 0;
    console.log(`📡 Template route completed. Model answered: "${output}", Tokens used: ${tokensUsed}`);
 
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
    console.error("GitHub Models /template error:", err);
    
    // Handle rate limiting specifically - check multiple possible error formats
    const isRateLimit = err.status === 429 || 
                       err.code === 'rate_limit_exceeded' ||
                       err?.error?.code === 'rate_limit_exceeded' ||
                       (err.response && err.response.status === 429) ||
                       (err.message && err.message.includes('rate limit')) ||
                       (err.message && err.message.includes('429'));
    
    if (isRateLimit) {
      console.log("Rate limit detected, returning fallback template");
      return res.status(429).json({ 
        message: "API_RATE_LIMIT_EXCEEDED", 
        userMessage: "GitHub Models rate limit exceeded. Please wait a moment and try again.",
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ], 
        uiPrompts: [reactBasePrompt] 
      });
    }
    
    return res.status(500).json({ message: "GitHub Models API call failed", error: err.message || err, uiPrompts: [] });
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
    requestCount++;
    console.log(`💬 Chat request #${requestCount} - Processing...`);
    
    // Add delay if we've made multiple requests recently
    if (requestCount > 2) {
      console.log("⏱️  Adding delay to prevent rate limiting...");
      await delay(2000);
    }
    const messages = req.body.messages.map((m: any) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const completion = await callGitHubModel([
      {
        role: "system",
        content: getSystemPrompt(),
      },
      ...messages,
    ], 1500);

    const content = completion.choices[0]?.message?.content || "";
    const tokensUsed = completion.usage?.total_tokens || 0;
    console.log(`💬 GitHub Models chat response received. Tokens used: ${tokensUsed}`);
    console.log("Response preview:", content.substring(0, 100) + "...");

    if (!content || (!content.includes("<boltArtifact") && !content.includes("```"))) {
      return res.status(400).json({
        message: "Invalid response format from GitHub Models - no XML or code blocks found",
        error: "Invalid format",
        uiPrompts: [`<boltArtifact id="initial-setup" title="Waiting for Response">
          <boltAction type="file" filePath="/src/App.tsx">
            export default function App() {
              return (
                <div className="flex min-h-screen items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Initializing Project</h1>
                    <p className="text-gray-600">Waiting for GitHub Models response...</p>
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
    console.error("GitHub Models /chat error:", err);
    
    // Handle rate limiting specifically - check multiple possible error formats
    const isRateLimit = err.status === 429 || 
                       err.code === 'rate_limit_exceeded' ||
                       err?.error?.code === 'rate_limit_exceeded' ||
                       (err.response && err.response.status === 429) ||
                       (err.message && err.message.includes('rate limit')) ||
                       (err.message && err.message.includes('429'));
    
    if (isRateLimit) {
      console.log("Rate limit detected in chat, returning fallback");
      return res.status(429).json({
        message: "API_RATE_LIMIT_EXCEEDED",
        userMessage: "GitHub Models rate limit exceeded. Please wait a moment and try again.",
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
                    <p>GitHub Models rate limit reached. Please wait and try again.</p>
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
                    <p>GitHub Models rate limit reached. Please wait and try again.</p>
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
      message: "GitHub Models chat API failed",
      error: err.message || err,
      uiPrompts: [`<boltArtifact id="initial-setup" title="API Connection Error">
        <boltAction type="file" filePath="/src/App.tsx">
          export default function App() {
            return (
              <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h1>
                  <p className="text-gray-600">Unable to connect to the GitHub Models API. Please try again.</p>
                </div>
              </div>
            );
          }
        </boltAction>
      </boltArtifact>`],
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


