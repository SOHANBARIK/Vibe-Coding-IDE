import { Play, Share2, Cloud } from 'lucide-react';

export default function Header({ handleRun }) {
  return (
    <div className="h-14 bg-[#1c2333] border-b border-[#2b3245] flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2">
         <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">F</div>
         <span className="text-gray-400 text-sm font-medium">Fractal / <span className="text-white">vibe-coding</span></span>
         <span className="px-2 py-0.5 rounded-full bg-[#2b3245] text-[10px] text-gray-400 border border-gray-700">Beta</span>
      </div>

      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2 text-xs text-gray-500">
            <Cloud size={14} />
            <span>Saved</span>
         </div>
         
         <button 
           onClick={handleRun}
           className="flex items-center gap-2 px-5 py-1.5 bg-[#00ff88] hover:bg-[#00e67a] text-[#0e1117] font-bold rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,136,0.2)]"
         >
           <Play size={16} fill="currentColor" />
           <span className="text-sm">Run</span>
         </button>

         <button className="p-2 text-gray-400 hover:text-white bg-[#2b3245] rounded-lg transition-colors">
            <Share2 size={18} />
         </button>
      </div>
    </div>
  );
}