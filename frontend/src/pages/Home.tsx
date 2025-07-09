import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import axios from "axios";
import { BACKEND_URL } from '../config';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-[#08080F] bg-gradient-to-b from-[#08080F] to-[#1A1633] flex flex-col items-center justify-start p-8 pt-16">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-2 bg-opacity-20">
            <code className="text-purple-400 text-2xl">&lt;&gt;</code>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">UCreate</span>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl text-gray-100 font-semibold mb-3 leading-tight">
            Transform your ideas into stunning web projects with AI.
          </h1>
          <p className="text-xl text-purple-400 mb-12">
            Just describe what you want to build.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-16">
          <div className="bg-[#12121F]/70 rounded-2xl p-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the project you want to create... (e.g., 'Create a modern portfolio website with dark theme and contact form')"
              className="w-full h-28 p-4 bg-[#12121F] text-gray-100 border border-purple-500/20 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-transparent resize-none placeholder-gray-500"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">Press Cmd+Enter to generate</span>
              <button
                type="submit"
                className="bg-purple-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-all"
              >
                Generate Project
              </button>
            </div>
          </div>
        </form>

        <div className="max-w-3xl mx-auto">
          <p className="text-gray-400 mb-4">Try these examples:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setPrompt("Create a modern portfolio website with dark theme")} 
              className="p-4 bg-[#12121F]/70 hover:bg-[#12121F] rounded-xl border border-purple-500/20 text-left text-gray-300 transition-all">
              Create a modern portfolio website with dark theme
            </button>
            <button onClick={() => setPrompt("Build a task management app with drag and drop")}
              className="p-4 bg-[#12121F]/70 hover:bg-[#12121F] rounded-xl border border-purple-500/20 text-left text-gray-300 transition-all">
              Build a task management app with drag and drop
            </button>
            <button onClick={() => setPrompt("Design a landing page for a SaaS product")}
              className="p-4 bg-[#12121F]/70 hover:bg-[#12121F] rounded-xl border border-purple-500/20 text-left text-gray-300 transition-all">
              Design a landing page for a SaaS product
            </button>
            <button onClick={() => setPrompt("Make a blog with authentication and comments")}
              className="p-4 bg-[#12121F]/70 hover:bg-[#12121F] rounded-xl border border-purple-500/20 text-left text-gray-300 transition-all">
              Make a blog with authentication and comments
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
          <div className="text-center">
            <div className="bg-[#12121F]/70 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-200 mb-1">AI-Powered Generation</h3>
            <p className="text-gray-500 text-sm">Advanced AI understands your requirements</p>
          </div>
          
          <div className="text-center">
            <div className="bg-[#12121F]/70 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-200 mb-1">Modern Stack</h3>
            <p className="text-gray-500 text-sm">Built with the latest technologies</p>
          </div>
          
          <div className="text-center">
            <div className="bg-[#12121F]/70 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-200 mb-1">Instant Preview</h3>
            <p className="text-gray-500 text-sm">See your project come to life instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}