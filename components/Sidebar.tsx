
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
    <div className="w-64 flex-shrink-0 flex flex-col relative z-20 shadow-lg transition-colors duration-300" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-main)' }}>

      {/* Header: Module Indicator */}
      <div className="p-6 relative overflow-hidden group" style={{ borderBottom: '1px solid var(--border-main)' }}>
        {/* Accent Line */}
        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'var(--navy)' }}></div>

        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
             <Command size={14} />
             <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Module</span>
           </div>
           <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--navy)' }}></div>
        </div>

        <div className="flex items-center gap-3 z-10 relative">
          <div className="p-2 rounded-md" style={{ background: 'rgba(0,49,83,0.08)', border: '1px solid rgba(0,49,83,0.15)', color: 'var(--navy)' }}>
             <ThemeIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight leading-none" style={{ color: 'var(--text-main)' }}>{theme.label}</h2>
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--navy)', opacity: 0.7 }}>Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text-faint)' }}>Filters</div>
        {buttons.map((btn) => {
          const isActive = activeFilter === btn.action;

          return (
            <button
              key={btn.id}
              onClick={() => onFilterChange(btn.action)}
              className="relative w-full px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group flex items-center justify-between"
              style={isActive
                ? { background: 'rgba(0,49,83,0.08)', color: 'var(--text-main)', border: '1px solid rgba(0,49,83,0.15)' }
                : { color: 'var(--text-muted)', border: '1px solid transparent' }}
            >
              <div className="flex items-center gap-3">
                {btn.isSpecial ? (
                    <Zap size={16} className={`${isActive ? 'text-yellow-500 fill-yellow-500' : ''} transition-colors`} style={!isActive ? { color: 'var(--text-faint)' } : {}} />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full transition-all duration-300" style={{ background: isActive ? 'var(--navy)' : 'var(--border-main)' }}></div>
                )}
                <span>{btn.label}</span>
              </div>

              {isActive && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
            </button>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-main)', background: 'var(--bg-subtle)' }}>
         <div className="rounded p-3 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>

            <div className="flex justify-between items-end mb-2">
               <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Filtered</span>
               <span className="text-xs font-mono font-bold" style={{ color: 'var(--navy)' }}>
                 {Math.round((filteredCount / Math.max(totalCount, 1)) * 100)}%
               </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
               <div
                 className="h-full transition-all duration-500"
                 style={{ width: `${(filteredCount / Math.max(totalCount, 1)) * 100}%`, background: 'var(--navy)' }}
               ></div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <div>
                 <span className="block" style={{ color: 'var(--text-faint)' }}>VISIBLE</span>
                 <span style={{ color: 'var(--text-main)' }}>{filteredCount}</span>
              </div>
              <div className="text-right">
                 <span className="flex items-center justify-end gap-1" style={{ color: 'var(--text-faint)' }}>
                    TOTAL <Database size={8} />
                 </span>
                 <span style={{ color: 'var(--text-main)' }}>{totalCount}</span>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};
