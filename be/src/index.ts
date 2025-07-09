require("dotenv").config();
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";

const app = express();
app.use(cors());
app.use(express.json());

// /template route - already working
app.post("/template", async (req, res) => {
  const prompt = req.body?.prompt;

  if (!prompt) {
    return res.status(400).json({ message: "Missing prompt in body", uiPrompts: [] });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-sonnet",
        messages: [
          {
            role: "system",
            content:
              "Reply with only one word: 'react' or 'node'. Do not explain. Do not add anything else. If the project is a frontend, reply 'react'. If backend, reply 'node'."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 10
      })
    });

    const data = await response.json();
    console.log("Full API response:", data);

    // Check for API errors
    if (data.error) {
      return res.status(400).json({
        message: data.error.message || "API Error",
        error: data.error,
        uiPrompts: []
      });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim().toLowerCase();
    console.log("Claude answer:", answer);

    if (answer === "react") {
      const templatePrompts = [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
      ];
      return res.json({
        prompts: templatePrompts,
        uiPrompts: [reactBasePrompt, templatePrompts[1]]  // Include both prompts for UI generation
      });
    }

    if (answer === "node") {
      return res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
        ],
        uiPrompts: [nodeBasePrompt]
      });
    }

    // Always include uiPrompts: [] in error/invalid responses
    return res.status(403).json({
      message: "Invalid model response",
      modelResponse: data,
      uiPrompts: []
    });
  } catch (err) {
    return res.status(500).json({
      message: "OpenRouter API call failed",
      error: err,
      uiPrompts: []
    });
  }
});

// ✅ /chat route - now added using OpenRouter
app.post("/chat", async (req, res) => {
  const messages = req.body?.messages;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ 
      message: "Invalid messages format.", 
      uiPrompts: [`<boltArtifact id="initial-setup" title="Project Setup">
        <boltAction type="file" filePath="/src/App.tsx">
          // Default setup will be added once API is available
          export default function App() {
            return (
              <div>Loading...</div>
            );
          }
        </boltAction>
      </boltArtifact>`] 
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-sonnet",
        messages: [
          {
            role: "system",
            content: getSystemPrompt()
          },
          ...messages
        ],
        max_tokens: 2500  // Stay under free tier limit of 2666
      })
    });

    const data = await response.json();
    console.log("Chat API response:", data);

    // Check for specific API errors
    if (data.error) {
      console.error("API Error:", data.error);
      
      // Handle credit/token limit errors
      if (data.error.message?.includes("credits") || data.error.message?.includes("tokens")) {
        return res.status(402).json({
          error: true,
          message: "API credit or token limit reached. Using fallback response.",
          response: `<steps>
            <step>
              <title>Project Files</title>
              <description>Initialize basic project structure</description>
              <type>CreateFolder</type>
              <status>pending</status>
            </step>
            <step>
              <title>Create package.json</title>
              <description>Set up project configuration</description>
              <type>CreateFile</type>
              <status>pending</status>
              <path>/package.json</path>
              <code>{
  "name": "project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "vite"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9"
  }
}</code>
            </step>
            <step>
              <title>Create index.html</title>
              <description>Create main HTML file</description>
              <type>CreateFile</type>
              <status>pending</status>
              <path>/index.html</path>
              <code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8" /&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0" /&gt;
    &lt;title&gt;Project&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;div id="root"&gt;&lt;/div&gt;
    &lt;script type="module" src="/src/main.tsx"&gt;&lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;</code>
            </step>
            <step>
              <title>Create App Component</title>
              <description>Create main application component</description>
              <type>CreateFile</type>
              <status>pending</status>
              <path>/src/App.tsx</path>
              <code>export default function App() {
  return (
    &lt;div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12"&gt;
      &lt;div className="relative py-3 sm:max-w-xl sm:mx-auto"&gt;
        &lt;div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"&gt;&lt;/div&gt;
        &lt;div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20"&gt;
          &lt;div className="max-w-md mx-auto"&gt;
            &lt;div className="divide-y divide-gray-200"&gt;
              &lt;div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7"&gt;
                &lt;h1 className="text-2xl font-bold mb-8"&gt;Welcome to Your New Project&lt;/h1&gt;
                &lt;p&gt;Start editing to see some magic happen!&lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  )
}</code>
            </step>
          </steps>`
        });
      }

      // Handle other API errors
      return res.status(500).json({
        error: true,
        message: data.error.message || "An error occurred with the API"
      });
    }

    const content = data?.choices?.[0]?.message?.content;
    console.log("Claude chat response:", content);

    // Validate that we have content and it contains XML or code blocks
    if (!content || (!content.includes('<boltArtifact') && !content.includes('```'))) {
      return res.status(400).json({
        message: "Invalid response format from AI - no XML or code blocks found",
        error: "Invalid format",
        uiPrompts: [`<boltArtifact id="initial-setup" title="Waiting for Response">
          <boltAction type="file" filePath="/src/App.tsx">
            export default function App() {
              return (
                <div className="flex min-h-screen items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Initializing Project</h1>
                    <p className="text-gray-600">Waiting for AI response...</p>
                  </div>
                </div>
              );
            }
          </boltAction>
          <boltAction type="file" filePath="/src/index.css">
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
          </boltAction>
        </boltArtifact>`]
      });
    }

    res.json({
      response: content,
      uiPrompts: [content]  // Add the content to uiPrompts array so it gets parsed
    });
  } catch (error) {
    return res.status(500).json({
      message: "OpenRouter chat API failed",
      error,
      uiPrompts: [`<boltArtifact id="initial-setup" title="API Connection Error">
        <boltAction type="file" filePath="/src/App.tsx">
          export default function App() {
            return (
              <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h1>
                  <p className="text-gray-600">Unable to connect to the API. Please try again.</p>
                </div>
              </div>
            );
          }
        </boltAction>
        <boltAction type="file" filePath="/src/index.css">
          @tailwind base;
          @tailwind components;
          @tailwind utilities;
        </boltAction>
      </boltArtifact>`]
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
