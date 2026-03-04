
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, Briefcase, Users, Shield, Terminal, FileCode, User, HardHat, AlertTriangle } from 'lucide-react';
import { DataService } from '../services/dataService';
import { SearchResult, SearchResultType } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string, entityId?: string, entityType?: SearchResultType) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      setResults(getBaseCommands());
    }
  }, [isOpen]);

  // Live Search Effect
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults(getBaseCommands());
        return;
      }
      setIsLoading(true);
      try {
        const data = await DataService.searchGlobal(query);
        setResults([...data, ...getBaseCommands().filter(c => c.title.toLowerCase().includes(query.toLowerCase()))]);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const getBaseCommands = (): SearchResult[] => [
    { id: 'home', type: 'COMMAND', title: 'Go to Operations Center', subtitle: 'Dashboard Home' },
    { id: 'library', type: 'COMMAND', title: 'Browse Standards Library', subtitle: 'CAD Assets' },
    { id: 'projects', type: 'COMMAND', title: 'Open Project Manager', subtitle: 'Jobs & Tasks' },
    { id: 'siterecon', type: 'COMMAND', title: 'Launch Site Recon', subtitle: 'Geospatial Tools' },
    { id: 'personnel', type: 'COMMAND', title: 'Personnel Directory', subtitle: 'HR Records' },
    { id: 'safety', type: 'COMMAND', title: 'Safety & Incident Log', subtitle: 'HSE Division' },
    { id: 'admin', type: 'COMMAND', title: 'System Administration', subtitle: 'Settings & Logs' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (!result) return;
    
    if (result.type === 'COMMAND') {
      onNavigate(result.id);
    } else if (result.type === 'STANDARD') {
      onNavigate('library', result.id, 'STANDARD');
    } else if (result.type === 'PROJECT') {
      onNavigate('projects', result.id, 'PROJECT');
    } else if (result.type === 'EMPLOYEE') {
      onNavigate('personnel', result.id, 'EMPLOYEE');
    } else if (result.type === 'INCIDENT') {
      onNavigate('safety', result.id, 'INCIDENT');
    }
    
    onClose();
  };

  const getIcon = (type: SearchResultType) => {
      switch(type) {
          case 'COMMAND': return <Terminal size={18} />;
          case 'STANDARD': return <FileCode size={18} className="text-emerald-500" />;
          case 'PROJECT': return <Briefcase size={18} className="text-[var(--navy)]" />;
          case 'EMPLOYEE': return <User size={18} className="text-amber-500" />;
          case 'INCIDENT': return <AlertTriangle size={18} className="text-red-500" />;
          default: return <Command size={18} />;
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-100" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--navy)]/50 rounded-lg shadow-[0_0_50px_rgba(0,49,83,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-top-4 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[var(--bg-main)]">
          <Search className="text-[var(--navy)]" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search Global Database (Projects, Staff, Standards)..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-600 font-mono text-sm"
          />
          {isLoading && <div className="text-neutral-500 text-xs animate-pulse">Scanning...</div>}
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-white/5">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
           {results.length > 0 ? (
             results.map((res, index) => (
               <button
                 key={`${res.type}-${res.id}`}
                 onClick={() => handleSelect(res)}
                 onMouseEnter={() => setSelectedIndex(index)}
                 className={`w-full flex items-center justify-between p-3 rounded group transition-all duration-75 ${index === selectedIndex ? 'bg-[var(--navy)] text-white shadow-lg' : 'text-neutral-400 hover:bg-white/5'}`}
               >
                  <div className="flex items-center gap-4">
                    <div className={index === selectedIndex ? 'text-white' : 'text-neutral-500'}>
                        {getIcon(res.type)}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold">{res.title}</div>
                        <div className={`text-[10px] font-mono ${index === selectedIndex ? 'text-white/70' : 'text-neutral-600'}`}>{res.subtitle}</div>
                    </div>
                  </div>
                  {index === selectedIndex && <ArrowRight size={14} className="animate-pulse"/>}
               </button>
             ))
           ) : (
             <div className="p-8 text-center text-neutral-500 text-sm font-mono">
               No matching records found in database.
             </div>
           )}
        </div>
        
        <div className="p-2 border-t border-white/10 bg-[var(--bg-main)] flex justify-between items-center text-[10px] text-neutral-600 font-mono px-4">
           <span>ACME NEUROLINK v2.0 // DEEP SEARCH</span>
           <div className="flex gap-3">
             <span className="flex items-center gap-1"><span className="text-[var(--navy)]">↑↓</span> to navigate</span>
             <span className="flex items-center gap-1"><span className="text-[var(--navy)]">↵</span> to select</span>
           </div>
        </div>
      </div>
    </div>
  );
};
