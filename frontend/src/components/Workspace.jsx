import Editor from "@monaco-editor/react";
import { Terminal, FileJson, X, Maximize2 } from 'lucide-react';

export default function Workspace({ code, setCode, output }) {
  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0d1117] relative">
      
      {/* 1. Editor Tabs (Glass Effect) */}
      <div className="h-10 flex items-center bg-[#161b22]/80 backdrop-blur-md border-b border-[#30363d] overflow-x-auto">
        <div className="flex items-center gap-2 px-4 h-full bg-[#0d1117] border-t-2 border-[#238636] text-sm text-gray-200 min-w-[140px]">
          <FileJson size={14} className="text-yellow-400" />
          <span>main.py</span>
          <X size={14} className="ml-auto text-gray-500 hover:text-white cursor-pointer" />
        </div>
        <div className="px-4 h-full flex items-center text-sm text-gray-500 hover:text-gray-300 cursor-pointer border-r border-[#30363d] transition-colors">
          readme.md
        </div>
      </div>

      {/* 2. Main Content Area (Split View) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* CODE EDITOR (Left Side) */}
        <div className="flex-1 relative">
          <Editor
            height="100%" 
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 15, // Slightly larger font
              minimap: { enabled: false },
              padding: { top: 20 },
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              backgroundColor: '#0d1117', // Match background
            }}
          />
        </div>

        {/* TERMINAL (Right Side - Floating Glass Panel) */}
        <div className="w-[400px] border-l border-[#30363d] flex flex-col bg-[#0d1117]/95 backdrop-blur shadow-xl z-10">
          
          <div className="h-10 flex items-center justify-between px-4 border-b border-[#30363d] bg-[#161b22]">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Terminal size={14} />
              <span>Console Output</span>
            </div>
            <Maximize2 size={14} className="text-gray-500 hover:text-white cursor-pointer" />
          </div>
          
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar">
            {output.split('\n').map((line, i) => (
              <div key={i} className={`mb-1 break-words ${
                line.includes('ERROR') ? 'text-red-400 font-bold' : 'text-gray-300'
              }`}>
                {line || <br/>}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2 opacity-50">
              <span className="text-green-500">➜</span>
              <span className="w-2 h-4 bg-gray-500 animate-pulse block"></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}