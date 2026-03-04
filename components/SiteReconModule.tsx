
import React, { useState } from 'react';
import { performSiteRecon } from '../services/geminiService';
import { SiteReconReport } from '../types';
import { Map, Search, Globe, AlertTriangle, FileText, ExternalLink, Loader2, Navigation, Crosshair, Layers, Zap } from 'lucide-react';

export const SiteReconModule: React.FC = () => {
  const [locationInput, setLocationInput] = useState('');
  const [report, setReport] = useState<SiteReconReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!locationInput.trim()) return;

      setIsLoading(true);
      setError('');
      setReport(null);

      try {
          const result = await performSiteRecon(locationInput);
          setReport(result);
      } catch (err) {
          setError("Satellite Uplink Failed: Unable to retrieve geospatial data.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden relative">
      {/* Map Background Effect */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-[1600px] mx-auto w-full p-8">
          
          {/* Header */}
          <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-6">
              <div>
                  <div className="flex items-center gap-2 mb-2 text-emerald-500">
                      <Globe size={16} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Geospatial Intelligence</span>
                  </div>
                  <h1 className="text-4xl font-bold text-[var(--text-main)] tracking-tight">Site Reconnaissance</h1>
                  <p className="text-neutral-500 mt-2 max-w-2xl">
                      Deploy virtual assessment agents to analyze terrain, constraints, and context before field deployment.
                  </p>
              </div>
              <div className="hidden md:block">
                   <div className="px-4 py-2 bg-[var(--bg-card)] border border-white/10 rounded flex items-center gap-3">
                       <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                           <span className="text-[10px] text-neutral-400 font-mono uppercase">Sat-Link: ACTIVE</span>
                       </div>
                       <div className="h-4 w-px bg-white/10"></div>
                       <div className="text-[10px] text-neutral-400 font-mono uppercase">Lat: 38.4404° N</div>
                   </div>
              </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
              
              {/* Left Panel: Input & Controls */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                  
                  {/* Search Box */}
                  <div className="bg-[var(--bg-card)] border border-emerald-500/30 rounded-sm p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Search size={16} className="text-emerald-500"/> Target Acquisition
                      </h2>
                      
                      <form onSubmit={handleScan} className="space-y-4 relative z-10">
                          <div>
                              <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2 block">Location / Coordinates</label>
                              <div className="relative">
                                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16}/>
                                  <input 
                                      type="text" 
                                      value={locationInput}
                                      onChange={(e) => setLocationInput(e.target.value)}
                                      placeholder="e.g. 1234 Skyline Blvd, Palo Alto, CA"
                                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                  />
                              </div>
                          </div>
                          
                          <button 
                              type="submit"
                              disabled={isLoading || !locationInput}
                              className={`
                                  w-full py-3 rounded font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all
                                  ${isLoading 
                                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/20'}
                              `}
                          >
                              {isLoading ? <Loader2 size={16} className="animate-spin"/> : <Crosshair size={16}/>}
                              {isLoading ? 'Scanning Terrain...' : 'Initiate Scan'}
                          </button>
                      </form>
                  </div>

                  {/* Status / History */}
                  <div className="flex-1 bg-[var(--bg-card)] border border-white/10 rounded-sm p-6 relative">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                          Mission Logs
                      </h3>
                      <div className="space-y-3">
                          {report ? (
                             <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                 <div className="flex justify-between items-start mb-1">
                                     <span className="text-xs font-bold text-emerald-400">Scan Complete</span>
                                     <span className="text-[9px] font-mono text-emerald-500/70">{new Date().toLocaleTimeString()}</span>
                                 </div>
                                 <p className="text-[10px] text-emerald-300/70 truncate">{locationInput}</p>
                             </div>
                          ) : (
                             <div className="text-center py-10 text-neutral-600">
                                 <Navigation size={32} className="mx-auto mb-2 opacity-20"/>
                                 <p className="text-xs font-mono">Waiting for target coordinates...</p>
                             </div>
                          )}
                      </div>
                  </div>

              </div>

              {/* Right Panel: Analysis Report */}
              <div className="w-full lg:w-2/3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-sm relative flex flex-col overflow-hidden">
                  
                  {/* Decorative Scan Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]"></div>
                  
                  {report ? (
                      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-8">
                          <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                              <div>
                                  <h2 className="text-2xl font-bold text-white mb-1">Preliminary Site Assessment</h2>
                                  <p className="text-sm text-neutral-400 font-mono flex items-center gap-2">
                                      ID: {report.id} <span className="text-neutral-600">|</span> {report.timestamp}
                                  </p>
                              </div>
                              <div className="flex gap-2">
                                  {report.groundingUrls.map((url, i) => (
                                      <a 
                                        key={i}
                                        href={url.uri}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                      >
                                          <Map size={12}/> View Map
                                      </a>
                                  ))}
                              </div>
                          </div>

                          <div className="prose prose-invert prose-sm max-w-none">
                              {/* Render Markdown roughly */}
                              {report.analysis.split('\n').map((line, i) => {
                                  if (line.startsWith('##')) return <h3 key={i} className="text-lg font-bold text-emerald-400 mt-6 mb-3 uppercase tracking-wider">{line.replace('##', '').trim()}</h3>;
                                  if (line.startsWith('**')) return <p key={i} className="font-bold text-white my-2">{line.replace(/\*\*/g, '')}</p>;
                                  if (line.startsWith('- ')) return (
                                      <div key={i} className="flex items-start gap-2 mb-2 pl-4">
                                          <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                          <span className="text-neutral-300">{line.replace('- ', '')}</span>
                                      </div>
                                  );
                                  return <p key={i} className="text-neutral-400 mb-2 leading-relaxed">{line}</p>;
                              })}
                          </div>

                          <div className="mt-8 pt-6 border-t border-white/10">
                              <div className="flex items-center gap-2 text-amber-500 mb-2">
                                  <AlertTriangle size={16}/>
                                  <span className="text-xs font-bold uppercase tracking-wider">Disclaimer</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 leading-relaxed italic">
                                  This automated report is generated by AI based on available public map data. 
                                  It does not constitute a legal survey or engineering stamp. 
                                  Field verification is mandatory before design.
                              </p>
                          </div>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 relative z-10">
                          {isLoading ? (
                              <div className="text-center">
                                  <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
                                  <h3 className="text-xl font-bold text-white animate-pulse">Acquiring Satellite Data...</h3>
                                  <p className="text-sm font-mono text-emerald-500 mt-2">Triangulating Coordinates</p>
                              </div>
                          ) : (
                              <div className="text-center max-w-md p-8">
                                  <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                      <Zap size={40} className="text-neutral-700" />
                                  </div>
                                  <h3 className="text-lg font-bold text-neutral-400 mb-2">System Idle</h3>
                                  <p className="text-sm">Enter a location to generate a comprehensive site context report including terrain analysis and constraint identification.</p>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Overlay Grid */}
                  <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none z-20"></div>
              </div>
          </div>
      </div>
    </div>
  );
};
