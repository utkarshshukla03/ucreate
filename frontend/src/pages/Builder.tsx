import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';

// Fallback content function
const getFallbackContent = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex Johnson - Portfolio</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
            color: #ffffff;
            line-height: 1.6;
        }
        
        .portfolio {
            min-height: 100vh;
        }
        
        .navbar {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            z-index: 1000;
            padding: 1rem 0;
        }
        
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2rem;
        }
        
        .logo-text {
            font-size: 1.5rem;
            font-weight: bold;
            background: linear-gradient(45deg, #00d4ff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .nav-menu {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-menu a {
            color: #ffffff;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .nav-menu a:hover {
            color: #00d4ff;
        }
        
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 0 2rem;
        }
        
        .hero-content {
            max-width: 800px;
        }
        
        .hero-title {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        
        .highlight {
            background: linear-gradient(45deg, #00d4ff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero-subtitle {
            font-size: 1.5rem;
            color: #00d4ff;
            margin-bottom: 1.5rem;
        }
        
        .hero-description {
            font-size: 1.1rem;
            color: #cccccc;
            margin-bottom: 2rem;
            line-height: 1.8;
        }
        
        .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn-primary, .btn-secondary {
            padding: 0.8rem 2rem;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #00d4ff, #ff00ff);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
        }
        
        .btn-secondary {
            background: transparent;
            color: #00d4ff;
            border: 2px solid #00d4ff;
        }
        
        .btn-secondary:hover {
            background: #00d4ff;
            color: #000;
            transform: translateY(-2px);
        }
        
        .section {
            padding: 5rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .section-title {
            font-size: 2.5rem;
            text-align: center;
            margin-bottom: 3rem;
            background: linear-gradient(45deg, #00d4ff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
        }
        
        .about-text {
            font-size: 1.1rem;
            color: #cccccc;
            line-height: 1.8;
        }
        
        .skills {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .skill {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            backdrop-filter: blur(10px);
            transition: transform 0.3s;
        }
        
        .skill:hover {
            transform: translateY(-5px);
        }
        
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .project-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            transition: transform 0.3s;
        }
        
        .project-card:hover {
            transform: translateY(-10px);
        }
        
        .project-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: #00d4ff;
        }
        
        .contact-form {
            max-width: 600px;
            margin: 0 auto;
            display: grid;
            gap: 1rem;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            margin-bottom: 0.5rem;
            color: #00d4ff;
        }
        
        .form-group input,
        .form-group textarea {
            padding: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            backdrop-filter: blur(10px);
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #00d4ff;
        }
        
        .footer {
            text-align: center;
            padding: 2rem;
            background: rgba(0, 0, 0, 0.5);
            margin-top: 3rem;
        }
        
        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.5rem;
            }
            
            .about-content {
                grid-template-columns: 1fr;
            }
            
            .nav-menu {
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="portfolio">
        <!-- Navigation -->
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <span class="logo-text">Portfolio</span>
                </div>
                <ul class="nav-menu">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </div>
        </nav>

        <!-- Hero Section -->
        <section id="home" class="hero">
            <div class="hero-content">
                <h1 class="hero-title">
                    Hi, I'm <span class="highlight">Alex Johnson</span>
                </h1>
                <p class="hero-subtitle">Full Stack Developer & UI/UX Designer</p>
                <p class="hero-description">
                    I create beautiful, responsive web applications with modern technologies.
                    Passionate about clean code and exceptional user experiences.
                </p>
                <div class="hero-buttons">
                    <button class="btn-primary">View My Work</button>
                    <button class="btn-secondary">Download CV</button>
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="section">
            <h2 class="section-title">About Me</h2>
            <div class="about-content">
                <div class="about-text">
                    <p>With over 5 years of experience in web development, I specialize in creating modern, responsive applications using cutting-edge technologies. My passion lies in transforming ideas into digital reality through clean, efficient code and intuitive design.</p>
                    <p>I believe in continuous learning and staying updated with the latest industry trends to deliver exceptional results that exceed expectations.</p>
                </div>
                <div class="skills">
                    <div class="skill">React</div>
                    <div class="skill">TypeScript</div>
                    <div class="skill">Node.js</div>
                    <div class="skill">Python</div>
                    <div class="skill">MongoDB</div>
                    <div class="skill">PostgreSQL</div>
                    <div class="skill">AWS</div>
                    <div class="skill">Docker</div>
                </div>
            </div>
        </section>

        <!-- Projects Section -->
        <section id="projects" class="section">
            <h2 class="section-title">Featured Projects</h2>
            <div class="projects-grid">
                <div class="project-card">
                    <h3 class="project-title">E-Commerce Platform</h3>
                    <p>A full-stack e-commerce solution built with React, Node.js, and MongoDB. Features include user authentication, payment integration, and admin dashboard.</p>
                </div>
                <div class="project-card">
                    <h3 class="project-title">Task Management App</h3>
                    <p>Collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.</p>
                </div>
                <div class="project-card">
                    <h3 class="project-title">Weather Dashboard</h3>
                    <p>Interactive weather dashboard with data visualization, location-based forecasts, and responsive design for all devices.</p>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="section">
            <h2 class="section-title">Get In Touch</h2>
            <form class="contact-form">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn-primary">Send Message</button>
            </form>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>&copy; 2024 Alex Johnson. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>`;
};

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [apiError, setError] = useState<string | null>(null);
  const { webcontainer, ready, error, timedOut } = useWebContainer();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [mountStatus, setMountStatus] = useState<'pending' | 'mounting' | 'mounted' | 'error'>('pending');
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);
  const [showServerBusyDialog, setShowServerBusyDialog] = useState(false);

  useEffect(() => {
    if (!webcontainer) return;
    
    console.log('Processing steps into files. Steps count:', steps.length);
    console.log('Pending steps:', steps.filter(({status}) => status === "pending"));
    
    let originalFiles = [...files];
    let updateHappened = false;

    steps.filter(({status}) => status === "pending").forEach(step => {
      console.log('Processing step:', step.title, 'Type:', step.type, 'Path:', step.path);
      updateHappened = true;
      if (step?.type === StepType.CreateFile && step.path) {
        // Clean the path - remove leading slashes and normalize
        const cleanPath = step.path.replace(/^\/+/, '');
        
        // Check if file already exists
        const existingFileIndex = originalFiles.findIndex(f => f.path === cleanPath);
        
        if (existingFileIndex >= 0) {
          // Update existing file
          console.log('Updating existing file:', cleanPath);
          originalFiles[existingFileIndex].content = step.code || '';
        } else {
          // Create new file
          const fileName = cleanPath.split('/').pop() || cleanPath;
          console.log('Creating new file:', cleanPath, 'with name:', fileName);
          originalFiles.push({
            name: fileName,
            type: 'file',
            path: cleanPath,
            content: step.code || ''
          });
        }
      }
    });

    if (updateHappened) {
      console.log('Files updated! New file count:', originalFiles.length);
      console.log('Files created:', originalFiles.map(f => ({ path: f.path, hasContent: !!f.content })));
      setFiles(originalFiles);
      setSteps(currentSteps => currentSteps.map((step: Step) => ({
        ...step,
        status: "completed" as const
      })));
    } else {
      console.log('No file updates needed. Current file count:', files.length);
    }
  }, [steps]);

  // Mount files to WebContainer
  useEffect(() => {
    const debugInfo = { 
      hasWebContainer: !!webcontainer, 
      isReady: ready,
      fileCount: files.length,
      currentMountStatus: mountStatus,
      filesExist: files.length > 0,
      webContainerReady: webcontainer && ready
    };
    
    if (!webcontainer || !ready || files.length === 0) {
      console.log('Skipping mount - not ready:', debugInfo);
      return;
    }

    console.log('Proceeding with mount:', debugInfo);

    // Add a small delay to ensure WebContainer is fully ready
    const timer = setTimeout(() => {
      const createMountStructure = (files: FileItem[]): Record<string, any> => {
        const mountStructure: Record<string, any> = {};
        
        // Helper function to ensure directories exist
        const ensureDirectoryExists = (dirPath: string) => {
          if (!dirPath || dirPath === '.') return;
          
          const parts = dirPath.split('/');
          let currentPath = '';
          
          for (const part of parts) {
            if (!part) continue;
            
            if (currentPath) {
              currentPath += '/' + part;
            } else {
              currentPath = part;
            }
            
            if (!mountStructure[currentPath]) {
              mountStructure[currentPath] = {
                directory: {}
              };
            }
          }
        };
        
        // First pass: create all directories
        files.forEach(file => {
          const cleanPath = file.path.replace(/^\/+/, ''); // Remove leading slash
          if (file.type === 'file') {
            const dirPath = cleanPath.split('/').slice(0, -1).join('/');
            if (dirPath) {
              ensureDirectoryExists(dirPath);
            }
          }
        });
        
        // Second pass: add all files
        files.forEach(file => {
          if (file.type === 'file') {
            const cleanPath = file.path.replace(/^\/+/, ''); // Remove leading slash
            mountStructure[cleanPath] = {
              file: {
                contents: file.content || ''
              }
            };
          }
        });
        
        return mountStructure;
      };

      const mountFiles = async () => {
        try {
          setMountStatus('mounting');
          const mountStructure = createMountStructure(files);
          console.log('Mounting structure:', mountStructure);
          console.log('Files being mounted:', Object.keys(mountStructure));
          
          await webcontainer.mount(mountStructure);
          console.log('Files mounted successfully');
          
          // Add a small delay to ensure files are fully written
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setMountStatus('mounted');
          console.log('Mount status: mounted');
        } catch (err) {
          console.error('Mount error:', err);
          setMountStatus('error');
          console.log('Mount status: error');
          // Don't fail completely, still allow preview to try loading
        }
      };

      mountFiles();
    }, 100); // Small delay to ensure WebContainer is ready

    return () => clearTimeout(timer);
  }, [files, webcontainer, ready]);

  async function init() {
    try {
      console.log('Starting initialization with prompt:', prompt);
      console.log('Backend URL:', BACKEND_URL);
      
      // Always show the dialog for any error to ensure user sees it
      let hasError = false;
      let response;
      let prompts = [];
      let uiPrompts = [];
      
      try {
        response = await axios.post(`${BACKEND_URL}/template`, {
          prompt: prompt.trim()
        });
        
        console.log('Template response:', response.data);
        prompts = response.data.prompts || [];
        uiPrompts = response.data.uiPrompts || [];
      } catch (templateErr: any) {
        console.error('Template endpoint failed:', templateErr);
        console.log('Template error details:', {
          status: templateErr.response?.status,
          message: templateErr.response?.data?.message,
          errorMessage: templateErr.message
        });
        
        hasError = true;
        // Show dialog and fallback immediately
        setShowServerBusyDialog(true);
        setTemplateSet(true);
        setShowFallbackNotice(true);
        
        const fallbackSteps = [
          {
            id: 1,
            title: "Create HTML Entry Point (Template Error)",
            description: "Template endpoint failed - using fallback portfolio",
            type: StepType.CreateFile,
            status: "pending" as const,
            path: "index.html",
            code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Modern Portfolio - Fallback</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
          },
          {
            id: 2,
            title: "Create Main Entry Point",
            description: "Setting up React entry point",
            type: StepType.CreateFile,
            status: "pending" as const,
            path: "src/main.tsx",
            code: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
          },
          {
            id: 3,
            title: "Create Modern Portfolio App (Template Error)",
            description: "Complete modern portfolio with dark theme",
            type: StepType.CreateFile,
            status: "pending" as const,
            path: "src/App.tsx",
            code: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="portfolio">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">Portfolio</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Hi, I'm <span className="highlight">Alex Johnson</span>
          </h1>
          <p className="hero-subtitle">Full Stack Developer & UI/UX Designer</p>
          <p className="hero-description">
            I create beautiful, responsive web applications with modern technologies.
            Passionate about clean code and exceptional user experiences.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">View My Work</button>
            <button className="btn-secondary">Download CV</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="profile-placeholder">
            <div className="avatar">AJ</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I'm a passionate full-stack developer with 5+ years of experience
                creating digital solutions that make a difference. I specialize in
                modern web technologies and love turning complex problems into
                simple, beautiful designs.
              </p>
              <div className="skills">
                <div className="skill-item">
                  <span className="skill-name">React</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '90%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">TypeScript</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Node.js</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">E-Commerce Platform</div>
              </div>
              <div className="project-info">
                <h3>E-Commerce Platform</h3>
                <p>Modern e-commerce solution with React, Node.js, and Stripe integration.</p>
                <div className="project-tags">
                  <span className="tag">React</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">MongoDB</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">Task Manager</div>
              </div>
              <div className="project-info">
                <h3>Task Management App</h3>
                <p>Collaborative task management tool with real-time updates and team features.</p>
                <div className="project-tags">
                  <span className="tag">Vue.js</span>
                  <span className="tag">Socket.io</span>
                  <span className="tag">Express</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">Weather App</div>
              </div>
              <div className="project-info">
                <h3>Weather Dashboard</h3>
                <p>Beautiful weather application with location-based forecasts and data visualization.</p>
                <div className="project-tags">
                  <span className="tag">React</span>
                  <span className="tag">Chart.js</span>
                  <span className="tag">OpenWeather API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Let's work together!</h3>
              <p>
                I'm always interested in new opportunities and exciting projects.
                Feel free to reach out if you'd like to collaborate.
              </p>
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="contact-icon">📧</span>
                  <span>alex.johnson@example.com</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📱</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📍</span>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" className="form-input" />
              <input type="email" placeholder="Your Email" className="form-input" />
              <textarea placeholder="Your Message" className="form-textarea" rows={5}></textarea>
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 Alex Johnson. All rights reserved.</p>
            <div className="social-links">
              <a href="#" className="social-link">GitHub</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`
          },
          {
            id: 4,
            title: "Create Package.json",
            description: "Setting up project dependencies",
            type: StepType.CreateFile,
            status: "pending" as const,
            path: "package.json",
            code: `{
  "name": "modern-portfolio-fallback",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
          },
          {
            id: 5,
            title: "Create TypeScript Config",
            description: "Setting up TypeScript configuration", 
            type: StepType.CreateFile,
            status: "pending" as const,
            path: "tsconfig.json",
            code: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`
          },
          {
            id: 6,
            title: "Create Vite Config",
            description: "Setting up Vite configuration",
            type: StepType.CreateFile,
            status: "pending" as const,
            path: "vite.config.ts",
            code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
          },
          {
            id: 7,
            title: "Create Modern Portfolio Styles",
            description: "Complete dark theme styling for portfolio",
            type: StepType.CreateFile,
            status: "pending" as const,
            path: "src/App.css",
            code: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #e2e8f0;
  background: #0f172a;
}

.portfolio {
  min-height: 100vh;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #1e293b;
  z-index: 1000;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-menu a:hover {
  color: #667eea;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 6rem 2rem 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #cbd5e1;
  padding: 0.875rem 2rem;
  border: 2px solid #334155;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}

.hero-image {
  display: flex;
  justify-content: center;
}

.profile-placeholder {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar {
  font-size: 4rem;
  font-weight: bold;
  color: white;
}

/* Sections */
.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* About Section */
.about {
  padding: 6rem 0;
  background: #1e293b;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
}

.about-text p {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.skills {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-name {
  font-weight: 600;
  color: #e2e8f0;
}

.skill-bar {
  height: 8px;
  background: #334155;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Projects Section */
.projects {
  padding: 6rem 0;
  background: #0f172a;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.project-card {
  background: #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid #334155;
}

.project-card:hover {
  transform: translateY(-8px);
}

.project-image {
  height: 200px;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-placeholder {
  color: #94a3b8;
  font-size: 1.2rem;
  font-weight: 600;
}

.project-info {
  padding: 1.5rem;
}

.project-info h3 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
}

.project-info p {
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Contact Section */
.contact {
  padding: 6rem 0;
  background: #1e293b;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1000px;
  margin: 0 auto;
}

.contact-info h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e2e8f0;
}

.contact-info p {
  color: #94a3b8;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #cbd5e1;
}

.contact-icon {
  font-size: 1.2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-input,
.form-textarea {
  background: #334155;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Footer */
.footer {
  background: #0f172a;
  padding: 2rem 0;
  border-top: 1px solid #1e293b;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-link {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}`
          }
        ];
        
        setSteps(fallbackSteps);
        return; // Exit early with fallback
      }
      
      if (!hasError) {
        setTemplateSet(true);

        if (uiPrompts?.[0]) {
          const parsedSteps = parseXml(uiPrompts[0]);
          console.log('Parsed UI steps:', parsedSteps);
          setSteps(parsedSteps.map((step: Step) => ({
            ...step,
            status: "pending" as const
          })));
        }

        setLoading(true);
        console.log('Sending chat request...');
        
        try {
          const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
            messages: [...prompts, prompt].map(content => ({
              role: "user" as const,
              content
            }))
          });

          console.log('Chat response:', stepsResponse.data);
          if (stepsResponse.data.response) {
            const parsedSteps = parseXml(stepsResponse.data.response);
            console.log('Parsed chat steps:', parsedSteps);
            setSteps(currentSteps => {
              const maxId = currentSteps.length > 0 ? Math.max(...currentSteps.map(s => s.id)) : 0;
              return [
                ...currentSteps,
                ...parsedSteps.map((step, index) => ({
                  ...step,
                  id: maxId + index + 1, // Ensure unique IDs
                  status: "pending" as const
                }))
              ];
            });

            setLlmMessages([
              ...prompts.map((content: string) => ({ role: "user" as const, content })),
              { role: "user", content: prompt },
              { role: "assistant", content: stepsResponse.data.response }
            ]);
          }
        } catch (chatErr: any) {
          console.error('Chat endpoint failed:', chatErr);
          hasError = true;
          
          // Handle rate limiting with specific message
          if (chatErr.response?.status === 429 || 
              chatErr.response?.data?.message === "API_RATE_LIMIT_EXCEEDED" ||
              chatErr.message?.includes('429') || 
              chatErr.message?.includes('rate limit')) {
            console.log('Rate limit detected, providing fallback template');
            setShowServerBusyDialog(true);
            setShowFallbackNotice(true);
            
            // Provide fallback steps for rate limit
            const fallbackSteps = [
              {
                id: 1,
                title: "Create HTML Entry Point (Rate Limited)",
                description: "Rate limited - using fallback portfolio",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "index.html",
                code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Modern Portfolio - Fallback</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
              },
              {
                id: 2,
                title: "Create Main Entry Point",
                description: "Setting up React entry point",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "src/main.tsx",
                code: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
              },
              {
                id: 3,
                title: "Create Modern Portfolio App (Rate Limited)",
                description: "Complete modern portfolio with dark theme",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "src/App.tsx",
                code: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="portfolio">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">Portfolio</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Hi, I'm <span className="highlight">Alex Johnson</span>
          </h1>
          <p className="hero-subtitle">Full Stack Developer & UI/UX Designer</p>
          <p className="hero-description">
            I create beautiful, responsive web applications with modern technologies.
            Passionate about clean code and exceptional user experiences.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">View My Work</button>
            <button className="btn-secondary">Download CV</button>
          </div>
          <div className="fallback-notice">
            <span className="notice-icon">⚡</span>
            <span>API rate limit reached - showing fallback portfolio</span>
          </div>
        </div>
        <div className="hero-image">
          <div className="profile-placeholder">
            <div className="avatar">AJ</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I'm a passionate full-stack developer with 5+ years of experience
                creating digital solutions that make a difference. I specialize in
                modern web technologies and love turning complex problems into
                simple, beautiful designs.
              </p>
              <div className="skills">
                <div className="skill-item">
                  <span className="skill-name">React</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '90%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">TypeScript</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Node.js</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">E-Commerce Platform</div>
              </div>
              <div className="project-info">
                <h3>E-Commerce Platform</h3>
                <p>Modern e-commerce solution with React, Node.js, and Stripe integration.</p>
                <div className="project-tags">
                  <span className="tag">React</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">MongoDB</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">Task Manager</div>
              </div>
              <div className="project-info">
                <h3>Task Management App</h3>
                <p>Collaborative task management tool with real-time updates and team features.</p>
                <div className="project-tags">
                  <span className="tag">Vue.js</span>
                  <span className="tag">Socket.io</span>
                  <span className="tag">Express</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">Weather App</div>
              </div>
              <div className="project-info">
                <h3>Weather Dashboard</h3>
                <p>Beautiful weather application with location-based forecasts and data visualization.</p>
                <div className="project-tags">
                  <span className="tag">React</span>
                  <span className="tag">Chart.js</span>
                  <span className="tag">OpenWeather API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Let's work together!</h3>
              <p>
                I'm always interested in new opportunities and exciting projects.
                Feel free to reach out if you'd like to collaborate.
              </p>
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="contact-icon">📧</span>
                  <span>alex.johnson@example.com</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📱</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📍</span>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" className="form-input" />
              <input type="email" placeholder="Your Email" className="form-input" />
              <textarea placeholder="Your Message" className="form-textarea" rows={5}></textarea>
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 Alex Johnson. All rights reserved.</p>
            <div className="social-links">
              <a href="#" className="social-link">GitHub</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`
              },
              {
                id: 4,
                title: "Create Package.json",
                description: "Setting up project dependencies",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "package.json",
                code: `{
  "name": "modern-portfolio-fallback",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
              },
              {
                id: 5,
                title: "Create TypeScript Config",
                description: "Setting up TypeScript configuration", 
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "tsconfig.json",
                code: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`
              },
              {
                id: 6,
                title: "Create Vite Config",
                description: "Setting up Vite configuration",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "vite.config.ts",
                code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
              },
              {
                id: 7,
                title: "Create Modern Portfolio Styles",
                description: "Complete dark theme styling for portfolio",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "src/App.css",
                code: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #e2e8f0;
  background: #0f172a;
}

.portfolio {
  min-height: 100vh;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #1e293b;
  z-index: 1000;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-menu a:hover {
  color: #667eea;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 6rem 2rem 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.fallback-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 0.5rem;
  color: #fb923c;
  font-size: 0.9rem;
  font-weight: 500;
}

.notice-icon {
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #cbd5e1;
  padding: 0.875rem 2rem;
  border: 2px solid #334155;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}

.hero-image {
  display: flex;
  justify-content: center;
}

.profile-placeholder {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar {
  font-size: 4rem;
  font-weight: bold;
  color: white;
}

/* Sections */
.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* About Section */
.about {
  padding: 6rem 0;
  background: #1e293b;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
}

.about-text p {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.skills {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-name {
  font-weight: 600;
  color: #e2e8f0;
}

.skill-bar {
  height: 8px;
  background: #334155;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Projects Section */
.projects {
  padding: 6rem 0;
  background: #0f172a;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.project-card {
  background: #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid #334155;
}

.project-card:hover {
  transform: translateY(-8px);
}

.project-image {
  height: 200px;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-placeholder {
  color: #94a3b8;
  font-size: 1.2rem;
  font-weight: 600;
}

.project-info {
  padding: 1.5rem;
}

.project-info h3 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
}

.project-info p {
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Contact Section */
.contact {
  padding: 6rem 0;
  background: #1e293b;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1000px;
  margin: 0 auto;
}

.contact-info h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e2e8f0;
}

.contact-info p {
  color: #94a3b8;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #cbd5e1;
}

.contact-icon {
  font-size: 1.2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-input,
.form-textarea {
  background: #334155;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Footer */
.footer {
  background: #0f172a;
  padding: 2rem 0;
  border-top: 1px solid #1e293b;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-link {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}`
              }
            ];
            setSteps(fallbackSteps);
          } else {
            // Handle any other chat errors
            console.log('Chat API error detected, using fallback template');
            setShowServerBusyDialog(true);
            setShowFallbackNotice(true);
            
            const fallbackSteps = [
              {
                id: 1,
                title: "Create HTML Entry Point (API Error)",
                description: "Chat API failed - using fallback portfolio",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "index.html",
                code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Modern Portfolio - Fallback</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
              },
              {
                id: 2,
                title: "Create Main Entry Point",
                description: "Setting up React entry point",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "src/main.tsx",
                code: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
              },
              {
                id: 3,
                title: "Create Modern Portfolio App (API Error)",
                description: "Complete modern portfolio with dark theme",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "src/App.tsx",
                code: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="portfolio">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">Portfolio</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Hi, I'm <span className="highlight">Alex Johnson</span>
          </h1>
          <p className="hero-subtitle">Full Stack Developer & UI/UX Designer</p>
          <p className="hero-description">
            I create beautiful, responsive web applications with modern technologies.
            Passionate about clean code and exceptional user experiences.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">View My Work</button>
            <button className="btn-secondary">Download CV</button>
          </div>
          <div className="fallback-notice">
            <span className="notice-icon">🔄</span>
            <span>Chat API error - showing fallback portfolio</span>
          </div>
        </div>
        <div className="hero-image">
          <div className="profile-placeholder">
            <div className="avatar">AJ</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I'm a passionate full-stack developer with 5+ years of experience
                creating digital solutions that make a difference. I specialize in
                modern web technologies and love turning complex problems into
                simple, beautiful designs.
              </p>
              <div className="skills">
                <div className="skill-item">
                  <span className="skill-name">React</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '90%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">TypeScript</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Node.js</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">E-Commerce Platform</div>
              </div>
              <div className="project-info">
                <h3>E-Commerce Platform</h3>
                <p>Modern e-commerce solution with React, Node.js, and Stripe integration.</p>
                <div className="project-tags">
                  <span className="tag">React</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">MongoDB</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">Task Manager</div>
              </div>
              <div className="project-info">
                <h3>Task Management App</h3>
                <p>Collaborative task management tool with real-time updates and team features.</p>
                <div className="project-tags">
                  <span className="tag">Vue.js</span>
                  <span className="tag">Socket.io</span>
                  <span className="tag">Express</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">Weather App</div>
              </div>
              <div className="project-info">
                <h3>Weather Dashboard</h3>
                <p>Beautiful weather application with location-based forecasts and data visualization.</p>
                <div className="project-tags">
                  <span className="tag">React</span>
                  <span className="tag">Chart.js</span>
                  <span className="tag">OpenWeather API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Let's work together!</h3>
              <p>
                I'm always interested in new opportunities and exciting projects.
                Feel free to reach out if you'd like to collaborate.
              </p>
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="contact-icon">📧</span>
                  <span>alex.johnson@example.com</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📱</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📍</span>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" className="form-input" />
              <input type="email" placeholder="Your Email" className="form-input" />
              <textarea placeholder="Your Message" className="form-textarea" rows={5}></textarea>
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 Alex Johnson. All rights reserved.</p>
            <div className="social-links">
              <a href="#" className="social-link">GitHub</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`
              },
              {
                id: 4,
                title: "Create Package.json",
                description: "Setting up project dependencies",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "package.json",
                code: `{
  "name": "modern-portfolio-fallback",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
              },
              {
                id: 5,
                title: "Create TypeScript Config",
                description: "Setting up TypeScript configuration", 
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "tsconfig.json",
                code: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`
              },
              {
                id: 6,
                title: "Create Vite Config",
                description: "Setting up Vite configuration",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "vite.config.ts",
                code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
              },
              {
                id: 7,
                title: "Create Modern Portfolio Styles",
                description: "Complete dark theme styling for portfolio",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "src/App.css",
                code: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #e2e8f0;
  background: #0f172a;
}

.portfolio {
  min-height: 100vh;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #1e293b;
  z-index: 1000;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-menu a:hover {
  color: #667eea;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 6rem 2rem 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.fallback-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 0.5rem;
  color: #fb923c;
  font-size: 0.9rem;
  font-weight: 500;
}

.notice-icon {
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #cbd5e1;
  padding: 0.875rem 2rem;
  border: 2px solid #334155;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}

.hero-image {
  display: flex;
  justify-content: center;
}

.profile-placeholder {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar {
  font-size: 4rem;
  font-weight: bold;
  color: white;
}

/* Sections */
.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* About Section */
.about {
  padding: 6rem 0;
  background: #1e293b;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
}

.about-text p {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.skills {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-name {
  font-weight: 600;
  color: #e2e8f0;
}

.skill-bar {
  height: 8px;
  background: #334155;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Projects Section */
.projects {
  padding: 6rem 0;
  background: #0f172a;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.project-card {
  background: #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid #334155;
}

.project-card:hover {
  transform: translateY(-8px);
}

.project-image {
  height: 200px;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-placeholder {
  color: #94a3b8;
  font-size: 1.2rem;
  font-weight: 600;
}

.project-info {
  padding: 1.5rem;
}

.project-info h3 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
}

.project-info p {
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Contact Section */
.contact {
  padding: 6rem 0;
  background: #1e293b;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1000px;
  margin: 0 auto;
}

.contact-info h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e2e8f0;
}

.contact-info p {
  color: #94a3b8;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #cbd5e1;
}

.contact-icon {
  font-size: 1.2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-input,
.form-textarea {
  background: #334155;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Footer */
.footer {
  background: #0f172a;
  padding: 2rem 0;
  border-top: 1px solid #1e293b;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-link {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}`
              },
              {
                id: 6,
                title: "Create TypeScript Config",
                description: "Setting up TypeScript configuration", 
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "tsconfig.json",
                code: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`
              },
              {
                id: 6,
                title: "Create Vite Config",
                description: "Setting up Vite configuration",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "/vite.config.ts",
                code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
              },
              {
                id: 7,
                title: "Create CSS Styles",
                description: "Adding styles",
                type: StepType.CreateFile,
                status: "pending" as const,
                path: "/src/App.css",
                code: `.App {
  text-align: center;
}

.App-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.App-header h1 {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
}

.App-header p {
  font-size: 1.2rem;
  margin: 10px 0;
}`
              }
            ];
            setSteps(fallbackSteps);
          }
        }
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
      console.log('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        errorMessage: err.message,
        errorCode: err.code,
        fullError: err
      });
      
      // Always show dialog and fallback for any error
      console.log('API error detected, showing dialog and using fallback template');
      setShowServerBusyDialog(true);
      setTemplateSet(true);
      setShowFallbackNotice(true);
      
      // Provide a comprehensive fallback template for any error
      const fallbackSteps = [
        {
          id: 1,
          title: "Create HTML Entry Point (Server Busy)",
          description: "Server is busy - using fallback portfolio",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "index.html",
          code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Modern Portfolio - Fallback</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
        },
        {
          id: 2,
          title: "Create Main Entry Point",
          description: "Setting up React entry point",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "src/main.tsx",
          code: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
        },
        {
          id: 3,
          title: "Create Modern Portfolio App (Server Busy)",
          description: "Complete modern portfolio with dark theme",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "src/App.tsx",
          code: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="portfolio">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">Portfolio</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Hi, I'm <span className="highlight">Alex Johnson</span>
          </h1>
          <p className="hero-subtitle">Full Stack Developer & UI/UX Designer</p>
          <p className="hero-description">
            I create beautiful, responsive web applications with modern technologies.
            Passionate about clean code and exceptional user experiences.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">View My Work</button>
            <button className="btn-secondary">Download CV</button>
          </div>
          <div className="fallback-notice">
            <span className="notice-icon">⚡</span>
            <span>Server busy - showing fallback portfolio</span>
          </div>
        </div>
        <div className="hero-image">
          <div className="profile-placeholder">
            <div className="avatar">AJ</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I'm a passionate full-stack developer with 5+ years of experience
                creating digital solutions that make a difference. I specialize in
                modern web technologies and love turning complex problems into
                simple, beautiful designs.
              </p>
              <div className="skills">
                <div className="skill-item">
                  <span className="skill-name">React</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '90%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">TypeScript</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Node.js</span>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">E-Commerce Platform</div>
              </div>
              <div className="project-info">
                <h3>E-Commerce Platform</h3>
                <p>Modern e-commerce solution with React, Node.js, and Stripe integration.</p>
                <div className="project-tags">
                  <span className="tag">React</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">MongoDB</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">Task Manager</div>
              </div>
              <div className="project-info">
                <h3>Task Management App</h3>
                <p>Collaborative task management tool with real-time updates and team features.</p>
                <div className="project-tags">
                  <span className="tag">Vue.js</span>
                  <span className="tag">Socket.io</span>
                  <span className="tag">Express</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">Weather App</div>
              </div>
              <div className="project-info">
                <h3>Weather Dashboard</h3>
                <p>Beautiful weather application with location-based forecasts and data visualization.</p>
                <div className="project-tags">
                  <span className="tag">React</span>
                  <span className="tag">Chart.js</span>
                  <span className="tag">OpenWeather API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Let's work together!</h3>
              <p>
                I'm always interested in new opportunities and exciting projects.
                Feel free to reach out if you'd like to collaborate.
              </p>
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="contact-icon">📧</span>
                  <span>alex.johnson@example.com</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📱</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📍</span>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" className="form-input" />
              <input type="email" placeholder="Your Email" className="form-input" />
              <textarea placeholder="Your Message" className="form-textarea" rows={5}></textarea>
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 Alex Johnson. All rights reserved.</p>
            <div className="social-links">
              <a href="#" className="social-link">GitHub</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`
        },
        {
          id: 4,
          title: "Add Modern Portfolio Styling",
          description: "Complete dark theme CSS for portfolio",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "src/App.css",
          code: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a0a0a;
  color: #ffffff;
  line-height: 1.6;
}

.portfolio {
  min-height: 100vh;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: #667eea;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 1rem;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: #b0b0b0;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.fallback-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 8px;
  color: #ffa500;
  font-size: 0.9rem;
  margin-top: 1rem;
  width: fit-content;
}

.notice-icon {
  font-size: 1.2rem;
}

.hero-image {
  display: flex;
  justify-content: center;
}

.profile-placeholder {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.avatar {
  font-size: 4rem;
  font-weight: 700;
  color: white;
}

/* Sections */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.about {
  padding: 6rem 0;
  background: #111111;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
}

.about-text p {
  font-size: 1.1rem;
  color: #b0b0b0;
  margin-bottom: 2rem;
  text-align: center;
}

.skills {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-name {
  font-weight: 600;
  min-width: 120px;
}

.skill-bar {
  flex: 1;
  height: 8px;
  background: #333;
  border-radius: 4px;
  margin-left: 1rem;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

/* Projects */
.projects {
  padding: 6rem 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.project-card {
  background: #111111;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
}

.project-image {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-placeholder {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
}

.project-info {
  padding: 1.5rem;
}

.project-info h3 {
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.project-info p {
  color: #b0b0b0;
  margin-bottom: 1rem;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

/* Contact */
.contact {
  padding: 6rem 0;
  background: #111111;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.contact-info h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.contact-info p {
  color: #b0b0b0;
  margin-bottom: 2rem;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contact-icon {
  font-size: 1.2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-input, .form-textarea {
  padding: 1rem;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-family: inherit;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Footer */
.footer {
  padding: 2rem 0;
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.3s;
}

.social-link:hover {
  color: #667eea;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
  }
}`
        },
        {
          id: 5,
          title: "Create Package.json",
          description: "Setting up project dependencies",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "package.json",
          code: `{
  "name": "modern-portfolio-fallback",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
        },
        {
          id: 6,
          title: "Create TypeScript Config",
          description: "Setting up TypeScript configuration", 
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "tsconfig.json",
          code: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`
        },
        {
          id: 7,
          title: "Create Vite Config",
          description: "Setting up Vite configuration",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "vite.config.ts",
          code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
        },
        {
          id: 5,
          title: "Create Package.json",
          description: "Setting up project dependencies",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "package.json",
          code: `{
  "name": "modern-portfolio-fallback",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
        },
        {
          id: 5,
          title: "Create TypeScript Config",
          description: "Setting up TypeScript configuration", 
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "/tsconfig.json",
          code: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`
        },
        {
          id: 6,
          title: "Create Vite Config",
          description: "Setting up Vite configuration",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "/vite.config.ts",
          code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
        },
        {
          id: 7,
          title: "Create CSS Styles",
          description: "Adding styles with status indicator",
          type: StepType.CreateFile,
          status: "pending" as const,
          path: "/src/App.css",
          code: `.App {
  text-align: center;
}

.App-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.App-header h1 {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
}

.App-header p {
  font-size: 1.2rem;
  margin: 10px 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}`
        }
      ];
      
      setSteps(fallbackSteps);
      setError(null); // Clear any previous errors
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, [prompt]);

  // Convert flat file structure to nested structure for FileExplorer
  const createNestedFileStructure = (flatFiles: FileItem[]): FileItem[] => {
    const nested: FileItem[] = [];
    const folderMap = new Map<string, FileItem>();

    // Sort files to ensure folders are processed before their contents
    const sortedFiles = [...flatFiles].sort((a, b) => {
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;
      return aDepth - bDepth;
    });

    sortedFiles.forEach(file => {
      const pathParts = file.path.split('/');
      
      if (pathParts.length === 1) {
        // Root level file
        nested.push(file);
      } else {
        // File in a folder
        const folderPath = pathParts.slice(0, -1).join('/');
        
        // Ensure all parent folders exist
        let currentPath = '';
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (currentPath) {
            currentPath += '/' + pathParts[i];
          } else {
            currentPath = pathParts[i];
          }
          
          if (!folderMap.has(currentPath)) {
            const folderItem: FileItem = {
              name: pathParts[i],
              type: 'folder',
              path: currentPath,
              children: []
            };
            folderMap.set(currentPath, folderItem);
            
            if (i === 0) {
              // Root level folder
              nested.push(folderItem);
            } else {
              // Nested folder
              const parentPath = currentPath.split('/').slice(0, -1).join('/');
              const parentFolder = folderMap.get(parentPath);
              if (parentFolder && parentFolder.children) {
                parentFolder.children.push(folderItem);
              }
            }
          }
        }
        
        // Add file to its parent folder
        const parentFolder = folderMap.get(folderPath);
        if (parentFolder && parentFolder.children) {
          parentFolder.children.push(file);
        }
      }
    });

    return nested;
  };

  const nestedFiles = createNestedFileStructure(files);

  // Early return for loading and error states
  
  // Show fallback UI immediately for API errors or WebContainer timeout
  if (apiError || timedOut) {
    const fallbackContent = getFallbackContent();
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
        <div className="h-full overflow-hidden">
          <iframe 
            srcDoc={fallbackContent}
            className="w-full h-full border-0"
            title="Fallback Portfolio"
          />
        </div>
      </div>
    );
  }

  // Show WebContainer loading only when no errors and not timed out
  if (!ready && !timedOut && !apiError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#08080F]">
        <div className="text-center">
          <Loader />
          <p className="text-gray-400 mt-4">Initializing WebContainer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#08080F]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Failed to initialize WebContainer</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#08080F]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">API Connection Error</h2>
          <p className="text-gray-400 mb-4">{apiError}</p>
          <button 
            onClick={() => {
              setError(null);
              setTemplateSet(false);
              init();
            }} 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col">
      {/* Glassmorphism Server Busy Dialog */}
      {showServerBusyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Dialog */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {/* Glass effect gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-500/20 rounded-2xl" />
            
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 mb-6 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-4">
                Our servers are a bit busy
              </h3>
              
              {/* Message */}
              <p className="text-gray-200 mb-6 leading-relaxed">
                Don't worry! We're working hard behind the scenes. Your project is being created with a reliable fallback template while our AI takes a quick breather.
              </p>
              
              {/* Sub message */}
              <p className="text-gray-300 text-sm mb-8">
                ✨ Your creativity never stops, and neither do we!
              </p>
              
              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowServerBusyDialog(false)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  Continue Building
                </button>
                <button 
                  onClick={() => {
                    setShowServerBusyDialog(false);
                    setError(null);
                    setTemplateSet(false);
                    setShowFallbackNotice(false);
                    init();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#12121F] border-b border-[#1A1633] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-gray-200 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
          <div className="h-5 w-px bg-gray-700" />
          <h1 className="text-gray-200">Project Workspace</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              activeTab === 'code' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              activeTab === 'preview'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>
      </header>
      
      {/* Fallback Notice Banner */}
      {showFallbackNotice && (
        <div className="bg-orange-600/20 border-b border-orange-500/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833-.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-orange-400 font-medium">Using Fallback Template</p>
              <p className="text-orange-300 text-sm">API rate limit reached. Using a fallback template while you wait.</p>
            </div>
            <button 
              onClick={() => setShowFallbackNotice(false)}
              className="ml-auto text-orange-400 hover:text-orange-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden grid grid-cols-[300px_300px_1fr] gap-0">
        {/* Generation Progress */}
        <div className="bg-[#0C0C14] border-r border-[#1A1633] p-4 overflow-y-auto">
          <div className="flex items-center gap-2 text-purple-400 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="font-medium">Generation Progress</h2>
          </div>
          <div className="space-y-4">
            <StepsList
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
            {(loading || !templateSet) ? (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to update, fix, or regenerate..."
                  className="w-full h-24 bg-[#12121F] text-gray-200 border border-[#1A1633] rounded-lg p-3 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const newMessage = { role: "user" as const, content: userPrompt };
                        setLoading(true);
                        const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                          messages: [...llmMessages, newMessage]
                        });
                        setLoading(false);
                        setLlmMessages(x => [...x, newMessage, {
                          role: "assistant",
                          content: stepsResponse.data.response
                        }]);
                        setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                          ...x,
                          status: "pending" as const
                        }))]);
                      } catch (error) {
                        console.error('Chat error:', error);
                        setLoading(false);
                        // Could add user feedback here
                      }
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                  >
                    Update
                  </button>
                  <button className="bg-orange-600/20 text-orange-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600/30">
                    Fix
                  </button>
                  <button className="bg-purple-600/20 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600/30">
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Explorer */}
        <div className="bg-[#0C0C14] border-r border-[#1A1633] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-[#1A1633]">
            <h2 className="text-gray-200 font-medium">Project Files</h2>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-[#1A1633] rounded-md text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-[#1A1633] rounded-md text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-[#1A1633] rounded-md text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
          <FileExplorer 
            files={nestedFiles} 
            onFileSelect={setSelectedFile}
          />
        </div>

        {/* Main Content */}
        <div className="bg-[#08080F]">
          {activeTab === 'code' ? (
            <CodeEditor file={selectedFile} />
          ) : (
            webcontainer && mountStatus === 'mounted' ? (
              <PreviewFrame webContainer={webcontainer} files={files} mountStatus={mountStatus} />
            ) : (
              <div className="h-full bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-300">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <p className="text-sm">
                    {mountStatus === 'mounting' ? 'Preparing preview...' : 
                     mountStatus === 'error' ? 'Preview not available' : 
                     'Initializing preview...'}
                  </p>
                  {showFallbackNotice && (
                    <p className="text-xs text-amber-400">Using fallback portfolio template</p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0C0C14] border-t border-[#1A1633] px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center gap-1">
          Powered by AI • Built with <span className="text-red-400">♥</span>
        </div>
        <div className="flex items-center gap-4">
          <div>Lines: {selectedFile?.content?.split('\n').length || 0}</div>
          <div>UTF-8</div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            TypeScript
          </div>
        </div>
      </div>
    </div>
  );
}