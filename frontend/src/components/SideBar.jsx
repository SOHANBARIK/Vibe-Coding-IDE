import { FileJson, Code2, Loader2 } from 'lucide-react';

export default function Sidebar({ prompt, setPrompt, handleGenerate, loading }) {
  return (
    <div className="w-72 flex flex-col bg-[#1c2333] border-r border-[#2b3245]">
      {/* Explorer Header */}
      <div className="h-10 flex items-center px-4 text-xs font-bold tracking-wider text-gray-400 border-b border-[#2b3245]">
        EXPLORER
      </div>

      {/* File Tree */}
      <div className="p-2 border-b border-[#2b3245]">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2b3245]/50 rounded text-sm text-blue-400 cursor-pointer">
          <FileJson size={14} />
          <span className="font-mono">main.py</span>
        </div>
      </div>

      {/* AI Panel */}
      <div className="flex-1 flex flex-col p-4 gap-3 bg-[#11151c]/50">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Code2 size={14} className="text-[#00ff88]" />
          AI Architect
        </div>
        
        <textarea 
          className="flex-1 w-full bg-[#0e1117] border border-[#2b3245] rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-[#00ff88] transition-colors resize-none font-mono leading-relaxed"
          placeholder="Describe your app logic..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg ${
            loading 
              ? 'bg-[#2b3245] text-gray-500 cursor-not-allowed' 
              : 'bg-[#00ff88] hover:bg-[#00e67a] text-black shadow-[#00ff88]/20'
          }`}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Generate Code"}
        </button>
      </div>
    </div>
  );
}