import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { WebContainer } from '@webcontainer/api';
import { Loader } from '../components/Loader';

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const { webcontainer, ready, error } = useWebContainer();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [mountStatus, setMountStatus] = useState<'pending' | 'mounting' | 'mounted' | 'error'>('pending');

  useEffect(() => {
    if (!webcontainer) return;
    
    let originalFiles = [...files];
    let updateHappened = false;

    steps.filter(({status}) => status === "pending").forEach(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile && step.path) {
        const parsedPath = step.path.split("/").filter(Boolean); // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;
  
        let currentFolder = "";
        for (const pathPart of parsedPath) {
          currentFolder = `${currentFolder}/${pathPart}`;
          
          if (pathPart === parsedPath[parsedPath.length - 1]) {
            // final file
            const file = currentFileStructure.find(x => x.path === currentFolder);
            if (!file) {
              currentFileStructure.push({
                name: pathPart,
                type: 'file',
                path: currentFolder,
                content: step.code || ''
              });
            } else {
              file.content = step.code || '';
            }
          } else {
            // in a folder
            const folder = currentFileStructure.find(x => x.path === currentFolder);
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: pathPart,
                type: 'folder',
                path: currentFolder,
                children: []
              });
            }
  
            const nextFolder = currentFileStructure.find(x => x.path === currentFolder);
            if (nextFolder && nextFolder.children) {
              currentFileStructure = nextFolder.children;
            }
          }
        }
        originalFiles = finalAnswerRef;
      }
    });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps(currentSteps => currentSteps.map((step: Step) => ({
        ...step,
        status: "completed" as const
      })));
    }
  }, [steps]);

  // Mount files to WebContainer
  useEffect(() => {
    if (!webcontainer || !ready || files.length === 0) {
      console.log('Skipping mount - not ready:', { 
        hasWebContainer: !!webcontainer, 
        isReady: ready,
        fileCount: files.length 
      });
      return;
    }

    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem) => {
        const path = file.path.replace(/^\/+/, ''); // Remove leading slash
        
        if (file.type === 'folder' && file.children) {
          mountStructure[path] = {
            directory: {}
          };
          
          file.children.forEach(child => processFile(child));
        } else if (file.type === 'file') {
          mountStructure[path] = {
            file: {
              contents: file.content || ''
            }
          };
        }
      };
  
      files.forEach(file => processFile(file));
      return mountStructure;
    };

    const mountFiles = async () => {
      try {
        setMountStatus('mounting');
        const mountStructure = createMountStructure(files);
        console.log('Mounting structure:', mountStructure);
        
        await webcontainer.mount(mountStructure);
        console.log('Files mounted successfully');
        
        // Install dependencies
        const installProcess = await webcontainer.spawn('npm', ['install']);
        await installProcess.exit;
        
        // Start dev server
        const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('dev server:', data);
          }
        }));
        
        setMountStatus('mounted');
      } catch (err) {
        console.error('Mount error:', err);
        setMountStatus('error');
      }
    };

    mountFiles();
  }, [files, webcontainer]);

  async function init() {
    try {
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim()
      });
      
      setTemplateSet(true);
      const {prompts, uiPrompts} = response.data;

      if (uiPrompts?.[0]) {
        const parsedSteps = parseXml(uiPrompts[0]);
        setSteps(parsedSteps.map((step: Step) => ({
          ...step,
          status: "pending" as const
        })));
      }

      setLoading(true);
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map(content => ({
          role: "user" as const,
          content
        }))
      });

      if (stepsResponse.data.response) {
        const parsedSteps = parseXml(stepsResponse.data.response);
        setSteps(currentSteps => [
          ...currentSteps,
          ...parsedSteps.map(step => ({
            ...step,
            status: "pending" as const
          }))
        ]);

        setLlmMessages([
          ...prompts.map((content: string) => ({ role: "user" as const, content })),
          { role: "user", content: prompt },
          { role: "assistant", content: stepsResponse.data.response }
        ]);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, [prompt]);

  // Early return for loading and error states
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <Loader />
          <p className="text-gray-400 mt-4">Initializing WebContainer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Failed to initialize WebContainer</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col">
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
            files={files} 
            onFileSelect={setSelectedFile}
          />
        </div>

        {/* Main Content */}
        <div className="bg-[#08080F]">
          {activeTab === 'code' ? (
            <CodeEditor file={selectedFile} />
          ) : (
            <PreviewFrame webContainer={webcontainer!} files={files} />
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