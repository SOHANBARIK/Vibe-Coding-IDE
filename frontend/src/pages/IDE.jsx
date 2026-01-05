import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import { Play, Loader2, Code2, Terminal as TerminalIcon, Sparkles } from 'lucide-react';

// --- CONFIGURATION ---
// 1. Server for Java & Bash
const API_JAVA_BASH = import.meta.env.API_JAVA_BASH;

// 2. Server for Python, C, C++ (and others)
const API_GENERAL = import.meta.env.API_GENERAL;

export default function IDE() {
  const [code, setCode] = useState(`print("Hello World")`);
  const [output, setOutput] = useState("> Ready to compile...");
  const [language, setLanguage] = useState("python");
  const [prompt, setPrompt] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Helper function to get the correct API URL based on language
  const getApiEndpoint = () => {
    if (language === "java" || language === "bash") {
      return API_JAVA_BASH;
    }
    return API_GENERAL;
  };

  // Set boilerplate code when language changes
  useEffect(() => {
    const boilerplates = {
      python: 'print("Hello World")',
      javascript: 'console.log("Hello World");',
      cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello C++";\n    return 0;\n}',
      c: '#include <stdio.h>\n\nint main() {\n    printf("Hello C\\n");\n    return 0;\n}',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java");\n    }\n}',
      bash: 'echo "Hello Bash"'
    };
    
    // Only set code if a boilerplate exists for the selected language
    if (boilerplates[language]) {
        setCode(boilerplates[language]);
    }
  }, [language]);

  // 1. AI Generation Handler
  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setOutput(`> Initializing Vibe Agent for ${language}...`);
    
    const activeApi = getApiEndpoint(); // Select the correct server

    try {
      const res = await axios.post(`${activeApi}/generate`, {
        prompt: prompt,
        user_id: "user",
        language: language
      });
      
      setCode(res.data.final_code);
      setOutput(res.data.status === "success" ? res.data.output : `ERROR:\n${res.data.output}`);
    } catch (err) {
      console.error("API Error:", err);
      setOutput(`Error connecting to ${activeApi}\n${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Manual Run Handler
  const handleRun = async () => {
    setIsRunning(true);
    setOutput(`> Compiling ${language}...`);
    
    const activeApi = getApiEndpoint(); // Select the correct server

    try {
      const res = await axios.post(`${activeApi}/execute`, {
        code: code,
        language: language
      });
      setOutput(res.data.output);
    } catch (err) {
      console.error("API Error:", err);
      setOutput(`Error connecting to ${activeApi}\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-col h-full w-full">
      
      {/* HEADER */}
      <div className="app-header">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-xl">
             <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding: '4px', borderRadius: '6px' }}>
                  <Code2 size={20} className="text-white" />
                </div>

                <span className="text-transparent bg-clip-text bg-gradient-to-r ...">
                  Vibe Code IDE
                </span>
          </div>
          
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] text-white rounded px-3 py-1 outline-none focus:border-green-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript (Node)</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="c">C (GCC)</option>
            <option value="java">Java</option>
            <option value="bash">Bash</option>
          </select>
        </div>

        {/* RUN BUTTON */}
        <button 
          className="btn-primary" 
          onClick={handleRun} 
          disabled={isRunning}
        >
           {isRunning ? <Loader2 className="animate-spin" size={16}/> : <Play size={16} />}
           Run Code
        </button>
      </div>

      <div className="main-layout">
        
        {/* SIDEBAR */}
        <div className="app-sidebar" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
            AI Architect          
          </div>
          
          <textarea 
            className="prompt-input"
            style={{ 
              flex: 1, 
              minHeight: '150px', 
              resize: 'none',
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              color: '#e6edf3',
              padding: '12px',
              borderRadius: '8px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            placeholder="Describe what you want to build..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          {/* VIBE BUTTON */}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
              opacity: isGenerating ? 0.7 : 1,
              boxShadow: '0 4px 14px 0 rgba(168, 85, 247, 0.39)'
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} /> 
                Thinking...
              </>
            ) : (
              <>
                <Sparkles size={18} /> 
                Generate
              </>
            )}
          </button>
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #30363d' }}>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Online Compiler</span>
            </div>
            <div className="text-gray-500 text-xs mt-1 font-mono">
              Created by <span className="text-indigo-400 font-bold">Sohan</span>
            </div>
          </div>

        </div>

        <div className="workspace">
          <div className="editor-container">
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              theme="vs-dark"
              value={code}
              onChange={setCode}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
          <div className="terminal">
            <div className="terminal-header"><TerminalIcon size={14}/> Terminal</div>
            <div className="terminal-output">{output}</div>
          </div>
        </div>
      </div>
     </div>
  );
}