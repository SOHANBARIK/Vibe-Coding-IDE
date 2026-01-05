import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import { Play, Loader2, Code2, Terminal as TerminalIcon, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export default function IDE() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("> Ready...");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Set boilerplate code when language changes
  useEffect(() => {
    const boilerplates = {
      python: 'print("Hello World")',
      javascript: 'console.log("Hello World");',
      cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello C++";\n    return 0;\n}',
      c: '#include <stdio.h>\n\nint main() {\n    printf("Hello C\\n");\n    return 0;\n}',
    };
    setCode(boilerplates[language] || "");
  }, [language]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const res = await axios.post(`${API_BASE}/generate`, {
        prompt, user_id: "user", language
      });
      setCode(res.data.final_code);
      setOutput("AI: Code generated successfully.");
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally { setIsGenerating(false); }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await axios.post(`${API_BASE}/execute`, { code, language });
      setOutput(res.data.output);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally { setIsRunning(false); }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0d1117] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl text-indigo-400">Vibe Coder</span>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 outline-none"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded font-bold transition">
          {isRunning ? <Loader2 className="animate-spin" size={16}/> : <Play size={16} />} Run
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-[#30363d] p-4 flex flex-col gap-4">
          <label className="text-xs font-bold text-gray-500 uppercase">AI Architect</label>
          <textarea 
            className="flex-1 bg-[#0d1117] border border-[#30363d] p-3 rounded text-sm outline-none focus:border-indigo-500"
            placeholder="Describe your code..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-3 rounded font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90">
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Generate
          </button>
          <div className="mt-auto pt-4 border-t border-[#30363d] text-[10px] text-gray-500">
             Created by <span className="text-indigo-400">Sohan</span>
          </div>
        </div>

        {/* Editor & Terminal */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor height="100%" language={language} theme="vs-dark" value={code} onChange={setCode} />
          </div>
          <div className="h-48 border-t border-[#30363d] bg-[#010409] p-4 font-mono text-sm overflow-y-auto">
            <div className="text-gray-500 mb-2 border-b border-[#30363d] pb-1 flex items-center gap-2">
              <TerminalIcon size={14}/> Terminal
            </div>
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}