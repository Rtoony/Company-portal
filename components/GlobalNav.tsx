
import React from 'react';
import { Home, Book, Briefcase, Settings, Shield, Database, Activity, Users, Globe, HardHat, Sun, Moon, LayoutGrid } from 'lucide-react';

interface GlobalNavProps {
  activeModule: string;
  onNavigate: (module: string) => void;
}

export const GlobalNav: React.FC<GlobalNavProps> = ({ activeModule, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'projects', icon: Briefcase, label: 'Projects' },
    { id: 'library', icon: Book, label: 'Library' },
    { id: 'siterecon', icon: Globe, label: 'Site Recon' },
    { id: 'personnel', icon: Users, label: 'Personnel' },
    { id: 'safety', icon: HardHat, label: 'Safety' },
    { id: 'admin', icon: Shield, label: 'Admin' },
  ];

  // Access global theme via DOM or context (simplified here)
  const toggleTheme = () => {
     document.body.classList.toggle('light-mode');
  };

  return (
    <div className="w-16 flex-shrink-0 bg-[var(--bg-main)] border-r border-[var(--border-subtle)] flex flex-col items-center py-6 z-30 shadow-xl relative transition-colors duration-300">
      
      {/* Theme Toggle */}
      <div className="mb-6">
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-highlight)] hover:border-[var(--text-highlight)] transition-all"
            title="Toggle Theme"
          >
            <Sun size={14} className="block light-mode:hidden" />
            <Moon size={14} className="hidden light-mode:block" />
          </button>
      </div>

      {/* Logo / Brand */}
      <div className="mb-8 w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
        <LayoutGrid className="text-white" size={20} />
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group relative w-full flex justify-center py-2"
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r"></div>
              )}
              <div className={`
                p-2.5 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-[var(--bg-card)] text-indigo-500 shadow-inner border border-[var(--border-subtle)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'}
              `}>
                <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-neutral-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 z-50 shadow-xl">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Server Status Indicator */}
      <div className="mt-auto flex flex-col items-center gap-6 w-full">
        <div className="group relative flex flex-col items-center gap-2 cursor-help">
            {/* Status Dot */}
            <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
            </div>
            
            {/* Icon */}
            <Database size={16} className="text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors"/>

            {/* Popover Info */}
            <div className="absolute left-14 bottom-0 bg-neutral-900 border border-white/10 p-3 rounded w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                <div className="text-[10px] text-neutral-500 font-mono uppercase mb-1">System Status</div>
                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold font-mono">
                    <Activity size={12} /> ONLINE
                </div>
                <div className="text-[9px] text-neutral-600 mt-1 font-mono">
                    Latency: 24ms<br/>
                    Source: DataService_v1
                </div>
            </div>
        </div>

        <div className="w-8 h-[1px] bg-[var(--border-subtle)]"></div>

        <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors pb-4">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};
