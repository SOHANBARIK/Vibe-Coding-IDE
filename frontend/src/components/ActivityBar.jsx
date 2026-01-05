import { Menu, Search, FolderOpen, Settings, Github } from 'lucide-react';

export default function ActivityBar() {
  return (
    <div className="w-12 flex flex-col items-center py-4 bg-[#11151c] border-r border-[#2b3245] gap-6 z-10">
      <Menu size={20} className="text-gray-400 hover:text-white cursor-pointer" />
      <div className="relative group">
        <FolderOpen size={24} className="text-white cursor-pointer" />
        <div className="absolute left-0 top-0 h-full w-1 bg-[#00ff88] rounded-r"></div>
      </div>
      <Search size={22} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
      <Github size={22} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
      
      <div className="mt-auto pb-2">
        <Settings size={22} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
      </div>
    </div>
  );
}