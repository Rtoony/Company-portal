
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Activity, Database, Server, Lock, Bell, AlertTriangle, RefreshCw, Terminal, Edit } from 'lucide-react';
import { DataService, SystemLog } from '../services/dataService';

export const AdminModule: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [alertMessage, setAlertMessage] = useState("System will be offline for updates on Sunday at 02:00 AM.");
  const [isEditingAlert, setIsEditingAlert] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const fetchLogs = async () => {
          const data = await DataService.fetchLogs();
          setLogs(data);
      };
      
      fetchLogs();
      
      // Poll for new logs every 2 seconds
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
  }, []);

  const handleUpdateAlert = () => {
      const newMsg = window.prompt("Enter new system announcement:", alertMessage);
      if (newMsg) {
          setAlertMessage(newMsg);
          DataService.addLog('INFO', 'Updated Global Alert Message', 'ADMIN');
      }
  };

  const handleClearCache = () => {
      if (window.confirm("Purge local asset cache?")) {
          DataService.addLog('WARN', 'Manual Cache Purge Initiated', 'ADMIN');
          alert("Cache cleared successfully.");
      }
  };

  const handleForceLogout = () => {
      if (window.confirm("Force logout all non-admin users?")) {
          DataService.addLog('WARN', 'Forced Session Reset executed', 'SEC');
          alert("All sessions reset.");
      }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden relative">
       {/* Background Texture */}
       <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

       <div className="relative z-10 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-red-500" />
                  <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Restricted Access</span>
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">System Administration</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* System Health */}
              <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm p-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                          <Activity size={16} className="text-emerald-500"/> System Health Status
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-black/20 border border-white/5 rounded text-center">
                              <div className="text-[10px] text-neutral-500 uppercase mb-1">Uptime</div>
                              <div className="text-xl font-mono text-white font-bold">99.9%</div>
                          </div>
                          <div className="p-4 bg-black/20 border border-white/5 rounded text-center">
                              <div className="text-[10px] text-neutral-500 uppercase mb-1">Latency</div>
                              <div className="text-xl font-mono text-emerald-400 font-bold">24ms</div>
                          </div>
                          <div className="p-4 bg-black/20 border border-white/5 rounded text-center">
                              <div className="text-[10px] text-neutral-500 uppercase mb-1">Active Sessions</div>
                              <div className="text-xl font-mono text-blue-400 font-bold">12</div>
                          </div>
                          <div className="p-4 bg-black/20 border border-white/5 rounded text-center">
                              <div className="text-[10px] text-neutral-500 uppercase mb-1">DB Load</div>
                              <div className="text-xl font-mono text-amber-400 font-bold">34%</div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm overflow-hidden flex flex-col h-[400px]">
                      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#121212]">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                              <Terminal size={16} className="text-indigo-500"/> Live Transaction Log
                          </h3>
                          <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-[10px] text-emerald-500 font-mono uppercase">Monitoring</span>
                          </div>
                      </div>
                      <div className="flex-1 font-mono text-xs text-neutral-400 p-4 space-y-2 overflow-y-auto custom-scrollbar bg-black/30">
                          {logs.map((log) => (
                              <div key={log.id} className="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors animate-in fade-in slide-in-from-left-2 duration-300">
                                  <span className="text-neutral-600 shrink-0 w-16">{new Date(log.timestamp).toLocaleTimeString([], {hour12:false})}</span>
                                  <span className={`shrink-0 w-12 font-bold ${
                                      log.level === 'INFO' ? 'text-emerald-500' :
                                      log.level === 'WARN' ? 'text-amber-500' :
                                      log.level === 'ERROR' ? 'text-red-500' :
                                      'text-blue-500'
                                  }`}>{log.level}</span>
                                  <span className="text-neutral-500 shrink-0 w-20">[{log.module}]</span>
                                  <span className="text-neutral-300 break-all">{log.message}</span>
                              </div>
                          ))}
                          <div ref={logEndRef} />
                      </div>
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                  <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm p-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Server size={16} className="text-neutral-400"/> Server Control
                      </h3>
                      
                      <div className="space-y-3">
                          <button 
                            onClick={handleClearCache}
                            className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded flex items-center justify-between group transition-colors"
                          >
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-neutral-800 rounded text-neutral-400"><RefreshCw size={16}/></div>
                                  <div className="text-left">
                                      <div className="text-xs font-bold text-white">Clear Cache</div>
                                      <div className="text-[10px] text-neutral-500">Purge temporary assets</div>
                                  </div>
                              </div>
                          </button>
                          <button 
                            onClick={handleForceLogout}
                            className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded flex items-center justify-between group transition-colors"
                          >
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-neutral-800 rounded text-neutral-400"><Lock size={16}/></div>
                                  <div className="text-left">
                                      <div className="text-xs font-bold text-white">Force Logout</div>
                                      <div className="text-[10px] text-neutral-500">Reset all sessions</div>
                                  </div>
                              </div>
                          </button>
                          <button className="w-full p-3 bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 rounded flex items-center justify-between group transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-red-900/40 rounded text-red-400"><AlertTriangle size={16}/></div>
                                  <div className="text-left">
                                      <div className="text-xs font-bold text-red-400">Emergency Stop</div>
                                      <div className="text-[10px] text-red-500/70">Halt all DB writes</div>
                                  </div>
                              </div>
                          </button>
                      </div>
                  </div>

                  <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm p-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Bell size={16} className="text-yellow-500"/> Global Alerts
                      </h3>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                          <div className="text-xs text-yellow-200 font-bold mb-1">Broadcast Message</div>
                          <p className="text-[10px] text-yellow-500/80 leading-relaxed">
                              {alertMessage}
                          </p>
                          <button 
                            onClick={handleUpdateAlert}
                            className="mt-2 text-[10px] font-bold uppercase text-yellow-500 hover:text-white flex items-center gap-1"
                          >
                              <Edit size={10} /> Edit Announcement
                          </button>
                      </div>
                  </div>
              </div>

          </div>
       </div>
    </div>
  );
};
