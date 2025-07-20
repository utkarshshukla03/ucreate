"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const generative_ai_1 = require("@google/generative-ai");
const prompts_1 = require("./prompts");
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    safetySettings: [
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
        // Add other safety settings as required
    ],
});
// ------------------- TEMPLATE ROUTE -------------------
app.post("/template", async (req, res) => {
    const prompt = req.body?.prompt;
    if (!prompt)
        return res.status(400).json({ message: "Missing prompt in body", uiPrompts: [] });
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
                prompts_1.BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ];
            return res.json({ prompts: templatePrompts, uiPrompts: [react_1.basePrompt, templatePrompts[1]] });
        }
        if (output === "node") {
            return res.json({
                prompts: [
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [node_1.basePrompt],
            });
        }
        return res.status(403).json({ message: "Invalid model response", modelResponse: output, uiPrompts: [] });
    }
    catch (err) {
        console.error("Gemini /template error:", err);
        // Handle rate limiting specifically
        if (err.status === 429 || (err.response && err.response.status === 429)) {
            return res.status(200).json({
                message: "API rate limit reached. Using fallback template.",
                prompts: [
                    prompts_1.BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [react_1.basePrompt]
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
        const formattedMessages = messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.content }],
        }));
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: (0, prompts_1.getSystemPrompt)() }],
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
    }
    catch (err) {
        console.error("Gemini /chat error:", err);
        // Handle rate limiting specifically
        if (err.status === 429 || (err.response && err.response.status === 429)) {
            return res.status(200).json({
                message: "API rate limit reached. Using fallback response.",
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
                    <nav>
                      <a href="#about">About</a>
                      <a href="#projects">Projects</a>
                      <a href="#contact">Contact</a>
                    </nav>
                  </header>
                  
                  <main>
                    <section id="about">
                      <h2>About Me</h2>
                      <p>I'm a passionate developer creating amazing web experiences.</p>
                    </section>
                    
                    <section id="projects">
                      <h2>My Projects</h2>
                      <div className="projects-grid">
                        <div className="project-card">
                          <h3>Project 1</h3>
                          <p>A modern web application built with React.</p>
                        </div>
                        <div className="project-card">
                          <h3>Project 2</h3>
                          <p>An interactive dashboard with real-time data.</p>
                        </div>
                      </div>
                    </section>
                    
                    <section id="contact">
                      <h2>Contact Me</h2>
                      <p>Feel free to reach out for collaborations!</p>
                      <p>Email: contact@example.com</p>
                    </section>
                  </main>
                </div>
              );
            }

            export default App;
          </boltAction>
          
          <boltAction type="file" filePath="/src/App.css">
            .App {
              text-align: center;
            }

            .App-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px;
              color: white;
            }

            .App-header h1 {
              margin: 0 0 20px 0;
              font-size: 2.5rem;
            }

            .App-header nav {
              margin-top: 20px;
            }

            .App-header nav a {
              color: white;
              text-decoration: none;
              margin: 0 20px;
              font-weight: 500;
              transition: opacity 0.3s;
            }

            .App-header nav a:hover {
              opacity: 0.8;
            }

            main {
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px 20px;
            }

            section {
              margin: 60px 0;
              text-align: left;
            }

            h2 {
              color: #333;
              margin-bottom: 20px;
              font-size: 2rem;
            }

            .projects-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 30px;
              margin-top: 30px;
            }

            .project-card {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              transition: transform 0.3s;
            }

            .project-card:hover {
              transform: translateY(-5px);
            }

            .project-card h3 {
              color: #667eea;
              margin-bottom: 10px;
            }

            #contact {
              text-align: center;
              background: #f8f9fa;
              padding: 40px;
              border-radius: 10px;
            }
          </boltAction>
        </boltArtifact>`,
                uiPrompts: [`<boltArtifact id="rate-limit-fallback" title="Portfolio Website (Fallback)">
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
                    <p>API rate limit reached. This is a fallback template.</p>
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
