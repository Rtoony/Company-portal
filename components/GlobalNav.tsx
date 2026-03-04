
import React, { useState, useEffect } from 'react';
import { Home, Book, Briefcase, Settings, Shield, Database, Activity, Users, Globe, HardHat, Sun, Moon, Monitor, LayoutGrid } from 'lucide-react';

interface GlobalNavProps {
  activeModule: string;
  onNavigate: (module: string) => void;
}

export const GlobalNav: React.FC<GlobalNavProps> = ({ activeModule, onNavigate }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => {
    return (localStorage.getItem('br-theme') as 'light' | 'dark' | 'auto') || 'auto';
  });

  useEffect(() => {
    const apply = (t: string) => {
      if (t === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', t);
      }
    };
    apply(theme);
    localStorage.setItem('br-theme', theme);

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply('auto');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'projects', icon: Briefcase, label: 'Projects' },
    { id: 'library', icon: Book, label: 'Library' },
    { id: 'siterecon', icon: Globe, label: 'Site Recon' },
    { id: 'personnel', icon: Users, label: 'Personnel' },
    { id: 'safety', icon: HardHat, label: 'Safety' },
    { id: 'admin', icon: Shield, label: 'Admin' },
  ];

  return (
    <div className="w-16 flex-shrink-0 flex flex-col items-center py-4 z-30 relative transition-colors duration-300" style={{ background: 'var(--navy)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>

      {/* Brand Mark */}
      <div className="mb-6 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'var(--brred)' }}>
        <LayoutGrid className="text-white" size={20} />
      </div>

      {/* Theme Toggle Group */}
      <div className="mb-6 flex flex-col gap-1">
        <button
          onClick={() => setTheme('light')}
          className={`w-8 h-7 rounded flex items-center justify-center transition-all text-white/70 hover:text-white ${theme === 'light' ? 'bg-white/20' : 'bg-white/5'}`}
          title="Light Mode"
        >
          <Sun size={12} />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`w-8 h-7 rounded flex items-center justify-center transition-all text-white/70 hover:text-white ${theme === 'dark' ? 'bg-white/20' : 'bg-white/5'}`}
          title="Dark Mode"
        >
          <Moon size={12} />
        </button>
        <button
          onClick={() => setTheme('auto')}
          className={`w-8 h-7 rounded flex items-center justify-center transition-all text-white/70 hover:text-white ${theme === 'auto' ? 'bg-white/20' : 'bg-white/5'}`}
          title="Auto"
          style={theme === 'auto' ? { background: 'var(--brred)' } : {}}
        >
          <Monitor size={12} />
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-4 w-full">
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
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r" style={{ background: 'var(--brred)' }}></div>
              )}
              <div className={`
                p-2.5 rounded-xl transition-all duration-300
                ${isActive
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-white/50 hover:text-white hover:bg-white/10'}
              `}>
                <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              </div>

              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--navy)] text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 z-50 shadow-xl">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Server Status Indicator */}
      <div className="mt-auto flex flex-col items-center gap-6 w-full">
        <div className="group relative flex flex-col items-center gap-2 cursor-help">
            <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
            </div>

            <Database size={16} className="text-white/40 group-hover:text-emerald-500 transition-colors"/>

            <div className="absolute left-14 bottom-0 border p-3 rounded w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                <div className="text-[10px] font-mono uppercase mb-1" style={{ color: 'var(--text-muted)' }}>System Status</div>
                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold font-mono">
                    <Activity size={12} /> ONLINE
                </div>
                <div className="text-[9px] mt-1 font-mono" style={{ color: 'var(--text-faint)' }}>
                    Latency: 24ms<br/>
                    Source: DataService_v1
                </div>
            </div>
        </div>

        <div className="w-8 h-[1px] bg-white/10"></div>

        <button className="text-white/40 hover:text-white transition-colors pb-4">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};
