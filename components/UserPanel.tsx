
import React, { useState } from 'react';
import { UserProfile, UserPreferences } from '../types';
import { User, Settings, Bell, Download, LogOut, Award, Clock, ChevronRight, ToggleLeft, ToggleRight, Briefcase, Mail, Phone, Calendar, Shield, PenTool, FileText, Quote, LayoutGrid } from 'lucide-react';

interface UserPanelProps {
  user: UserProfile;
  onClose: () => void;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({ user, onClose, onUpdatePreferences }) => {
  const [activeTab, setActiveTab] = useState<'FILE' | 'CONFIG'>('FILE');
  const [imgError, setImgError] = useState(false);

  const toggleSetting = (key: keyof UserPreferences) => {
    if (typeof user.preferences[key] === 'boolean') {
        onUpdatePreferences({
            ...user.preferences,
            [key]: !user.preferences[key]
        });
    }
  };

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[400px] bg-[var(--bg-card)] border border-[var(--border-main)] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col font-sans ring-1 ring-white/20">
      
      {/* Header / Identity Strip */}
      <div className="bg-[#18181b] border-b border-[var(--border-subtle)] p-4 flex items-start gap-4 relative overflow-hidden">
         {/* Background Texture */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
         <div className="absolute top-0 right-0 p-2">
            <div className="px-2 py-1 border border-white/10 bg-white/5 rounded text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                OFFICIAL RECORD
            </div>
         </div>

         <div className="relative w-20 h-20 shrink-0">
             <div className="w-full h-full rounded bg-white border-2 border-indigo-500/50 overflow-hidden shadow-inner flex items-center justify-center">
                {!imgError ? (
                    <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                    crossOrigin="anonymous"
                    />
                ) : (
                    <User size={40} className="text-indigo-500/50"/>
                )}
             </div>
             <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full border-2 border-[#18181b] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                {user.level}
             </div>
         </div>

         <div className="pt-1">
            <h3 className="text-xl font-bold text-white leading-none mb-1">{user.name}</h3>
            <p className="text-indigo-400 text-xs font-mono uppercase tracking-wider mb-3">{user.title}</p>
            
            <div className="flex items-center gap-2">
               <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${user.status?.includes('Active') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-neutral-700 text-neutral-400'}`}>
                  {user.status || 'Unknown'}
               </span>
               <span className="text-[9px] font-mono text-neutral-500">ID: {user.id}</span>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] bg-[#09090b]">
         <button 
            onClick={() => setActiveTab('FILE')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'FILE' ? 'text-white bg-[#18181b] border-t-2 border-indigo-500' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
         >
            <FileText size={12} /> Personnel File
         </button>
         <button 
            onClick={() => setActiveTab('CONFIG')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'CONFIG' ? 'text-white bg-[#18181b] border-t-2 border-indigo-500' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
         >
            <Settings size={12} /> Sys. Config
         </button>
      </div>

      {/* Scrollable Content */}
      <div className="bg-[#18181b] h-96 overflow-y-auto custom-scrollbar relative">
         <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none"></div>
         
         {activeTab === 'FILE' && (
             <div className="p-5 space-y-6 relative z-10">
                
                {/* The Dossier */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/5">
                       <Briefcase size={16} className="text-neutral-500" />
                       <div>
                          <div className="text-[9px] text-neutral-500 uppercase tracking-wider">Department</div>
                          <div className="text-xs text-neutral-200 font-medium">{user.department || 'Unassigned'}</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/5">
                            <Calendar size={16} className="text-neutral-500" />
                            <div>
                                <div className="text-[9px] text-neutral-500 uppercase tracking-wider">Since</div>
                                <div className="text-xs text-neutral-200 font-medium">{user.startDate || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/5">
                            <Phone size={16} className="text-neutral-500" />
                            <div>
                                <div className="text-[9px] text-neutral-500 uppercase tracking-wider">Contact</div>
                                <div className="text-xs text-neutral-200 font-medium">{user.phone || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/5">
                       <Mail size={16} className="text-neutral-500" />
                       <div className="overflow-hidden">
                          <div className="text-[9px] text-neutral-500 uppercase tracking-wider">Email</div>
                          <div className="text-xs text-neutral-200 font-medium truncate">{user.email || 'N/A'}</div>
                       </div>
                    </div>
                </div>

                {/* Bio & Lore */}
                {user.bio && (
                    <div>
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Shield size={12}/> The Standard
                        </h4>
                        <p className="text-xs leading-relaxed text-neutral-400 border-l-2 border-indigo-500/30 pl-3 italic">
                            "{user.bio}"
                        </p>
                    </div>
                )}

                {/* Expertise Tags */}
                {user.expertise && (
                    <div>
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <PenTool size={12}/> Key Expertise
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {user.expertise.map((skill, i) => (
                                <span key={i} className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quote */}
                {user.quote && (
                    <div className="mt-2 p-3 bg-black/30 border border-dashed border-white/10 rounded text-center">
                        <Quote size={12} className="mx-auto text-neutral-600 mb-1 transform rotate-180" />
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wide">
                            {user.quote}
                        </p>
                    </div>
                )}

             </div>
         )}

         {activeTab === 'CONFIG' && (
             <div className="p-5 space-y-1 relative z-10">
                 <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-2">Interface</div>
                 
                 <button onClick={() => toggleSetting('showGrid')} className="w-full flex items-center justify-between p-3 rounded hover:bg-white/5 group transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <LayoutGrid size={14} />
                       </div>
                       <div className="text-left">
                          <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Engineering Grid</div>
                          <div className="text-[10px] text-neutral-500">Background overlay</div>
                       </div>
                    </div>
                    <div className="text-neutral-500 group-hover:text-white">
                        {user.preferences.showGrid ? <ToggleRight size={20} className="text-indigo-500" /> : <ToggleLeft size={20} />}
                    </div>
                 </button>

                 <button onClick={() => toggleSetting('notifications')} className="w-full flex items-center justify-between p-3 rounded hover:bg-white/5 group transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Bell size={14} />
                       </div>
                       <div className="text-left">
                          <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">System Alerts</div>
                          <div className="text-[10px] text-neutral-500">Push notifications</div>
                       </div>
                    </div>
                    <div className="text-neutral-500 group-hover:text-white">
                        {user.preferences.notifications ? <ToggleRight size={20} className="text-indigo-500" /> : <ToggleLeft size={20} />}
                    </div>
                 </button>
                 
                 <div className="h-px bg-white/5 my-2 mx-2"></div>
                 <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-2 mt-4">Data</div>

                 <button className="w-full flex items-center justify-between p-3 rounded hover:bg-white/5 group transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Download size={14} />
                       </div>
                       <div className="text-left">
                          <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Export Format</div>
                          <div className="text-[10px] text-neutral-500">Current: {user.preferences.defaultExport}</div>
                       </div>
                    </div>
                    <ChevronRight size={14} className="text-neutral-600 group-hover:text-white"/>
                 </button>
             </div>
         )}
      </div>

      {/* Footer */}
      <div className="bg-[#09090b] border-t border-[var(--border-subtle)] p-3 flex justify-between items-center">
          <span className="text-[9px] font-mono text-neutral-600">
             LAST LOGIN: TODAY, 06:00 AM
          </span>
          <button className="flex items-center gap-2 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors">
             <LogOut size={12} /> SIGN OUT
          </button>
      </div>
    </div>
  );
};
