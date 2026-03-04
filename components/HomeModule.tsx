
import React from 'react';
import { UserProfile } from '../types';
import { Database, ExternalLink, Lightbulb, Zap } from 'lucide-react';

interface HomeModuleProps {
  user: UserProfile;
  onNavigate: (module: string) => void;
}

export const HomeModule: React.FC<HomeModuleProps> = ({ user, onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar" style={{ background: 'var(--bg-main)' }}>
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 bg-grid opacity-20 pointer-events-none"></div>

      <div className="relative z-10 p-8 max-w-[1600px] mx-auto w-full">

         {/* Welcome Header */}
         <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>Welcome Back, {user.name}</h1>
                <p className="mt-2" style={{ color: 'var(--text-muted)' }}>System Status: <span className="text-emerald-500 font-bold">ONLINE</span></p>
            </div>

            <div className="flex gap-3 shrink-0 self-start md:self-center">
                <button
                    onClick={() => onNavigate('library')}
                    className="flex items-center gap-2 px-5 py-3 transition-colors rounded text-xs font-bold uppercase tracking-wider shadow-sm"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)', color: 'var(--text-main)' }}
                >
                    <Database size={16} style={{ color: 'var(--navy)' }} />
                    <span>Library</span>
                </button>
            </div>
         </div>

         {/* Main Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* --- COLUMN 1: PROJECT SNAPSHOT --- */}
            <div className="space-y-6">
                <div className="rounded overflow-hidden shadow-precision" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
                    <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Active Projects</h3>
                        <button onClick={() => onNavigate('projects')} className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--navy)' }}>View All</button>
                    </div>
                    <table className="w-full text-left text-xs">
                        <thead style={{ background: 'var(--th-bg)' }}>
                            <tr className="text-white font-mono uppercase">
                                <th className="p-3 font-medium">Project</th>
                                <th className="p-3 font-medium">Phase</th>
                                <th className="p-3 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                            <tr className="transition-colors cursor-pointer hover:brightness-95" onClick={() => onNavigate('projects')} style={{ color: 'var(--text-main)' }}>
                                <td className="p-3 font-bold">Smith Creek Subd.</td>
                                <td className="p-3" style={{ color: 'var(--text-muted)' }}>Const. Staking</td>
                                <td className="p-3 text-right text-emerald-600 font-mono font-semibold">ACTIVE</td>
                            </tr>
                            <tr className="transition-colors cursor-pointer hover:brightness-95" onClick={() => onNavigate('projects')} style={{ color: 'var(--text-main)' }}>
                                <td className="p-3 font-bold">Hwy 101 Widening</td>
                                <td className="p-3" style={{ color: 'var(--text-muted)' }}>Topo Survey</td>
                                <td className="p-3 text-right text-amber-600 font-mono font-semibold">DELAYED</td>
                            </tr>
                            <tr className="transition-colors cursor-pointer hover:brightness-95" onClick={() => onNavigate('projects')} style={{ color: 'var(--text-main)' }}>
                                <td className="p-3 font-bold">City Hall Annex</td>
                                <td className="p-3" style={{ color: 'var(--text-muted)' }}>As-Builts</td>
                                <td className="p-3 text-right text-emerald-600 font-mono font-semibold">ACTIVE</td>
                            </tr>
                            <tr className="transition-colors cursor-pointer hover:brightness-95" onClick={() => onNavigate('projects')} style={{ color: 'var(--text-main)' }}>
                                <td className="p-3 font-bold">Riverside Park</td>
                                <td className="p-3" style={{ color: 'var(--text-muted)' }}>Permitting</td>
                                <td className="p-3 text-right text-emerald-600 font-mono font-semibold">ACTIVE</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- COLUMN 2: INNOVATION & RESOURCES --- */}
            <div className="space-y-6">

                {/* INNOVATION HUB */}
                <div className="relative overflow-hidden rounded p-6 shadow-precision" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent-bar)' }}></div>
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Zap size={64} style={{ color: 'var(--navy)' }} />
                    </div>

                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <Lightbulb size={16} className="text-yellow-500" />
                        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Innovation Hub</h3>
                    </div>

                    <p className="text-xs mb-6 relative z-10 max-w-sm" style={{ color: 'var(--text-muted)' }}>
                        Submit ideas for new CAD standards, automation scripts, or workflow improvements directly to the drafting committee.
                    </p>

                    <div className="relative z-10">
                        <button className="w-full py-3 text-[10px] font-bold text-white rounded uppercase tracking-wider transition-all shadow-md hover:brightness-110" style={{ background: 'var(--brred)' }}>
                            + Submit Suggestion
                        </button>
                    </div>
                </div>

                {/* QUICK RESOURCES */}
                <div className="rounded p-6 shadow-precision" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                        <ExternalLink size={14} style={{ color: 'var(--text-muted)' }}/> Quick Resources
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['Timesheet Portal', 'Vehicle Reservation', 'IT Help Ticket', 'GIS Web Map'].map(label => (
                            <a key={label} href="#" className="p-3 rounded flex flex-col gap-2 transition-colors group" style={{ border: '1px solid var(--border-subtle)' }}>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-main)' }}>{label}</span>
                                <ExternalLink size={10} style={{ color: 'var(--text-faint)' }}/>
                            </a>
                        ))}
                    </div>
                </div>

            </div>

         </div>

         {/* Footer */}
         <div className="mt-10 pt-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-faint)' }}>
           <span style={{ color: 'var(--brred)' }}>Brelje &amp; Race</span> Consulting Engineers &mdash; BR Portal v2.4.0
         </div>

      </div>
    </div>
  );
};
