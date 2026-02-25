
import React from 'react';
import { UserProfile } from '../types';
import { Database, ExternalLink, Lightbulb, Zap } from 'lucide-react';

interface HomeModuleProps {
  user: UserProfile;
  onNavigate: (module: string) => void;
}

export const HomeModule: React.FC<HomeModuleProps> = ({ user, onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] relative overflow-y-auto custom-scrollbar">
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="relative z-10 p-8 max-w-[1600px] mx-auto w-full">
         
         {/* Welcome Header */}
         <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div className="flex-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back, {user.name}</h1>
                <p className="text-neutral-400 mt-2">System Status: <span className="text-emerald-500 font-bold">ONLINE</span></p>
            </div>
            
            <div className="flex gap-3 shrink-0 self-start md:self-center">
                <button 
                    onClick={() => onNavigate('library')}
                    className="flex items-center gap-2 px-5 py-3 bg-[#18181b] border border-[var(--border-main)] text-[var(--text-main)] hover:border-indigo-500 transition-colors rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                    <Database size={16} className="text-indigo-500" />
                    <span>Library</span>
                </button>
            </div>
         </div>

         {/* Main Grid - Simplified to 2 Columns */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* --- COLUMN 1: PROJECT SNAPSHOT --- */}
            <div className="space-y-6">
                <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm p-0 overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Projects</h3>
                        <button onClick={() => onNavigate('projects')} className="text-[10px] text-indigo-400 hover:text-indigo-300 uppercase tracking-wider">View All</button>
                    </div>
                    <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-neutral-500 font-mono uppercase">
                            <tr>
                                <th className="p-3 font-medium">Project</th>
                                <th className="p-3 font-medium">Phase</th>
                                <th className="p-3 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-neutral-300">
                            <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onNavigate('projects')}>
                                <td className="p-3 font-bold">Smith Creek Subd.</td>
                                <td className="p-3 text-neutral-500">Const. Staking</td>
                                <td className="p-3 text-right text-emerald-500 font-mono">ACTIVE</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onNavigate('projects')}>
                                <td className="p-3 font-bold">Hwy 101 Widening</td>
                                <td className="p-3 text-neutral-500">Topo Survey</td>
                                <td className="p-3 text-right text-amber-500 font-mono">DELAYED</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onNavigate('projects')}>
                                <td className="p-3 font-bold">City Hall Annex</td>
                                <td className="p-3 text-neutral-500">As-Builts</td>
                                <td className="p-3 text-right text-emerald-500 font-mono">ACTIVE</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onNavigate('projects')}>
                                <td className="p-3 font-bold">Riverside Park</td>
                                <td className="p-3 text-neutral-500">Permitting</td>
                                <td className="p-3 text-right text-emerald-500 font-mono">ACTIVE</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- COLUMN 2: INNOVATION & RESOURCES --- */}
            <div className="space-y-6">
                
                {/* AI INNOVATION HUB - Simplified */}
                <div className="bg-gradient-to-br from-indigo-900/20 to-[#18181b] border border-indigo-500/30 rounded-sm p-6 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Zap size={64} className="text-indigo-500" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <Lightbulb size={16} className="text-yellow-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Innovation Hub</h3>
                    </div>

                    <p className="text-xs text-neutral-400 mb-6 relative z-10 max-w-sm">
                        Submit ideas for new CAD standards, automation scripts, or workflow improvements directly to the drafting committee.
                    </p>

                    <div className="relative z-10">
                        <button className="w-full py-3 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-transparent rounded uppercase tracking-wider transition-all shadow-md">
                            + Submit Suggestion
                        </button>
                    </div>
                </div>

                {/* QUICK RESOURCES */}
                <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm p-6 shadow-lg">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ExternalLink size={14} className="text-neutral-500"/> Quick Resources
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <a href="#" className="p-3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded flex flex-col gap-2 transition-colors group">
                            <span className="text-xs text-neutral-300 group-hover:text-white font-medium">Timesheet Portal</span>
                            <ExternalLink size={10} className="text-neutral-600 group-hover:text-neutral-400"/>
                        </a>
                        <a href="#" className="p-3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded flex flex-col gap-2 transition-colors group">
                            <span className="text-xs text-neutral-300 group-hover:text-white font-medium">Vehicle Reservation</span>
                            <ExternalLink size={10} className="text-neutral-600 group-hover:text-neutral-400"/>
                        </a>
                        <a href="#" className="p-3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded flex flex-col gap-2 transition-colors group">
                            <span className="text-xs text-neutral-300 group-hover:text-white font-medium">IT Help Ticket</span>
                            <ExternalLink size={10} className="text-neutral-600 group-hover:text-neutral-400"/>
                        </a>
                        <a href="#" className="p-3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded flex flex-col gap-2 transition-colors group">
                            <span className="text-xs text-neutral-300 group-hover:text-white font-medium">GIS Web Map</span>
                            <ExternalLink size={10} className="text-neutral-600 group-hover:text-neutral-400"/>
                        </a>
                    </div>
                </div>

            </div>

         </div>

      </div>
    </div>
  );
};
