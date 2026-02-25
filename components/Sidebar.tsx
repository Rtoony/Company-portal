
import React from 'react';
import { NavButton, ThemeConfig, SidebarFilter } from '../types';
import { Settings, Battery, Zap, Hexagon, Layers, Terminal, TriangleAlert, Cuboid, Ruler, Book, Activity, Command, ChevronRight, Database } from 'lucide-react';

interface SidebarProps {
  buttons: NavButton[];
  theme: ThemeConfig;
  activeFilter: SidebarFilter;
  onFilterChange: (filter: SidebarFilter) => void;
  filteredCount: number;
  totalCount: number;
}

const ThemeIconMap: Record<string, React.ElementType> = {
  'Layers': Layers,
  'Terminal': Terminal,
  'TriangleAlert': TriangleAlert,
  'Cuboid': Cuboid,
  'Ruler': Ruler,
  'Book': Book
};

export const Sidebar: React.FC<SidebarProps> = ({ buttons, theme, activeFilter, onFilterChange, filteredCount, totalCount }) => {
  const ThemeIcon = ThemeIconMap[theme.iconName] || Hexagon;

  return (
    <div className="w-64 flex-shrink-0 bg-[#0f0f12] border-r border-white/10 flex flex-col relative z-20 shadow-2xl">
      
      {/* Header: System Indicator */}
      <div className="p-6 border-b border-white/10 bg-[#0f0f12] relative overflow-hidden group">
        {/* Accent Glow */}
        <div className={`absolute top-0 left-0 w-1 h-full ${theme.baseColor}`}></div>
        <div className={`absolute top-0 left-0 w-full h-[1px] ${theme.baseColor} opacity-50`}></div>

        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2 text-neutral-500">
             <Command size={14} />
             <span className="font-mono text-[10px] font-bold tracking-widest uppercase">System.Root</span>
           </div>
           <div className={`w-2 h-2 rounded-full ${theme.baseColor} shadow-[0_0_8px_rgba(255,255,255,0.4)] animate-pulse`}></div>
        </div>
        
        <div className="flex items-center gap-3 z-10 relative">
          <div className={`p-2 rounded-md bg-white/5 border border-white/10 ${theme.baseColor.replace('bg-', 'text-')}`}>
             <ThemeIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none">{theme.label}</h2>
            <span className={`text-[10px] font-mono ${theme.baseColor.replace('bg-', 'text-')} opacity-70 uppercase tracking-wider`}>Module Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest px-3 mb-2">Filters</div>
        {buttons.map((btn) => {
          const isActive = activeFilter === btn.action;
          
          return (
            <button
              key={btn.id}
              onClick={() => onFilterChange(btn.action)}
              className={`
                relative w-full px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group
                flex items-center justify-between
                ${isActive 
                  ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent'}
              `}
            >
              <div className="flex items-center gap-3">
                {btn.isSpecial ? (
                    <Zap size={16} className={`${isActive ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-500 group-hover:text-yellow-400'} transition-colors`} />
                ) : (
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? theme.baseColor : 'bg-neutral-700 group-hover:bg-neutral-500'}`}></div>
                )}
                <span>{btn.label}</span>
              </div>
              
              {isActive && <ChevronRight size={14} className="text-white/50" />}
            </button>
          );
        })}
      </div>

      {/* System Stats / Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
         <div className="bg-[#18181b] rounded border border-white/5 p-3 relative overflow-hidden">
            
            <div className="flex justify-between items-end mb-2">
               <span className="text-[10px] text-neutral-500 font-mono uppercase">Memory Load</span>
               <span className={`text-xs font-mono font-bold ${theme.baseColor.replace('bg-', 'text-')}`}>
                 {Math.round((filteredCount / Math.max(totalCount, 1)) * 100)}%
               </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
               <div 
                 className={`h-full ${theme.baseColor} transition-all duration-500`} 
                 style={{ width: `${(filteredCount / Math.max(totalCount, 1)) * 100}%` }}
               ></div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-400">
              <div>
                 <span className="block text-neutral-600">VISIBLE</span>
                 <span className="text-white">{filteredCount}</span>
              </div>
              <div className="text-right">
                 <span className="block text-neutral-600 flex items-center justify-end gap-1">
                    DB: CONNECTED <Database size={8} />
                 </span>
                 <span className="text-white">{totalCount}</span>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};
