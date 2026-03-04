
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { analyzeSafetyIncident, generateSafetyBriefing } from '../services/geminiService';
import { IncidentReport, IncidentType, IncidentSeverity } from '../types';
import { HardHat, AlertTriangle, AlertOctagon, CheckCircle2, ShieldAlert, Plus, Bot, Loader2, Thermometer, Hammer, Mic2, X, FileText, Siren } from 'lucide-react';

export const SafetyModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'BRIEFING'>('INCIDENTS');
    const [incidents, setIncidents] = useState<IncidentReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [showModal, setShowModal] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formType, setFormType] = useState<IncidentType>('NEAR_MISS');
    const [formSeverity, setFormSeverity] = useState<IncidentSeverity>('LOW');
    const [formLocation, setFormLocation] = useState('');
    const [aiAnalysisResult, setAiAnalysisResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Briefing State
    const [weather, setWeather] = useState('');
    const [workType, setWorkType] = useState('');
    const [briefingText, setBriefingText] = useState('');
    const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = async () => {
        setIsLoading(true);
        const data = await DataService.fetchIncidents();
        setIncidents(data);
        setIsLoading(false);
    };

    const handleAnalyze = async () => {
        if (!formDesc) return;
        setIsAnalyzing(true);
        const analysis = await analyzeSafetyIncident(formTitle, formDesc);
        setAiAnalysisResult(analysis);
        setIsAnalyzing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await DataService.addIncident({
            title: formTitle,
            description: formDesc,
            type: formType,
            severity: formSeverity,
            location: formLocation,
            aiAnalysis: aiAnalysisResult,
            reportedBy: 'Current User'
        });
        setShowModal(false);
        // Reset form
        setFormTitle('');
        setFormDesc('');
        setAiAnalysisResult('');
        loadIncidents();
    };

    const handleGenerateBriefing = async () => {
        if (!weather || !workType) return;
        setIsGeneratingBriefing(true);
        const briefing = await generateSafetyBriefing(weather, workType);
        setBriefingText(briefing);
        setIsGeneratingBriefing(false);
    };

    const getSeverityColor = (sev: IncidentSeverity) => {
        switch(sev) {
            case 'CRITICAL': return 'bg-red-500 text-white';
            case 'HIGH': return 'bg-orange-500 text-white';
            case 'MEDIUM': return 'bg-yellow-500 text-black';
            case 'LOW': return 'bg-emerald-500 text-white';
        }
    };

    const getTypeIcon = (type: IncidentType) => {
        switch(type) {
            case 'INJURY': return <Siren size={16} className="text-red-500"/>;
            case 'NEAR_MISS': return <AlertTriangle size={16} className="text-yellow-500"/>;
            case 'PROPERTY_DAMAGE': return <Hammer size={16} className="text-orange-500"/>;
            case 'ENVIRONMENTAL': return <ShieldAlert size={16} className="text-emerald-500"/>;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,#000000_25%,transparent_25%,transparent_75%,#000000_75%,#000000),linear-gradient(45deg,#000000_25%,transparent_25%,transparent_75%,#000000_75%,#000000)]" style={{ backgroundSize: '20px 20px', backgroundColor: '#18181b', opacity: 0.05 }}></div>
            
            <div className="relative z-10 p-8 max-w-[1600px] mx-auto w-full h-full flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-yellow-500">
                            <HardHat size={16} />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">HSE Division</span>
                        </div>
                        <h1 className="text-4xl font-bold text-[var(--text-main)] tracking-tight">Safety & Incident Response</h1>
                    </div>
                    
                    <div className="flex gap-2 p-1 bg-[var(--bg-card)] rounded border border-white/10">
                         <button 
                            onClick={() => setActiveTab('INCIDENTS')}
                            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'INCIDENTS' ? 'bg-yellow-600 text-black' : 'text-neutral-500 hover:text-white'}`}
                         >
                            Incident Log
                         </button>
                         <button 
                            onClick={() => setActiveTab('BRIEFING')}
                            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'BRIEFING' ? 'bg-yellow-600 text-black' : 'text-neutral-500 hover:text-white'}`}
                         >
                            Morning Briefing
                         </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    
                    {activeTab === 'INCIDENTS' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-6 bg-[var(--bg-card)] border border-emerald-500/30 rounded-sm flex flex-col items-center justify-center">
                                    <div className="text-4xl font-bold text-emerald-500 font-mono">42</div>
                                    <div className="text-[10px] font-bold uppercase text-neutral-500 mt-2 tracking-widest">Days Injury Free</div>
                                </div>
                                <div className="p-6 bg-[var(--bg-card)] border border-white/10 rounded-sm flex flex-col items-center justify-center">
                                    <div className="text-4xl font-bold text-yellow-500 font-mono">{incidents.filter(i => i.status === 'OPEN').length}</div>
                                    <div className="text-[10px] font-bold uppercase text-neutral-500 mt-2 tracking-widest">Open Investigations</div>
                                </div>
                                <div className="p-6 bg-[var(--bg-card)] border border-white/10 rounded-sm flex flex-col items-center justify-center col-span-2 relative overflow-hidden group">
                                     <button 
                                        onClick={() => setShowModal(true)}
                                        className="relative z-10 px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                                     >
                                         <AlertOctagon size={20} /> Report New Incident
                                     </button>
                                     <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] opacity-10"></div>
                                </div>
                            </div>

                            {/* List */}
                            <div className="bg-[var(--bg-card)] border border-white/10 rounded-sm overflow-hidden">
                                {isLoading ? (
                                    <div className="p-8 text-center text-neutral-500">Loading Records...</div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-[var(--bg-main)] text-[10px] uppercase font-bold text-neutral-500">
                                            <tr>
                                                <th className="p-4">ID / Date</th>
                                                <th className="p-4">Type</th>
                                                <th className="p-4">Severity</th>
                                                <th className="p-4">Details</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Analysis</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm text-neutral-300">
                                            {incidents.map(inc => (
                                                <tr key={inc.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="font-mono text-yellow-500 font-bold">{inc.id}</div>
                                                        <div className="text-[10px] text-neutral-500">{new Date(inc.date).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2 font-bold text-xs uppercase">
                                                            {getTypeIcon(inc.type)} {inc.type.replace('_', ' ')}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityColor(inc.severity)}`}>
                                                            {inc.severity}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 max-w-md">
                                                        <div className="font-bold text-white truncate">{inc.title}</div>
                                                        <div className="text-xs text-neutral-500 truncate">{inc.description}</div>
                                                        <div className="text-[10px] text-neutral-600 mt-1 flex items-center gap-1"><MapPinIcon size={10}/> {inc.location}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-[10px] font-bold uppercase">{inc.status}</div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {inc.aiAnalysis && (
                                                            <div className="inline-flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded">
                                                                <Bot size={12}/> Analyzed
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'BRIEFING' && (
                        <div className="flex gap-8 h-full">
                            <div className="w-1/3 space-y-6">
                                <div className="bg-[var(--bg-card)] border border-yellow-500/30 rounded-sm p-6 shadow-2xl">
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Mic2 size={16} className="text-yellow-500"/> Briefing Config
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-2">Current Weather</label>
                                            <div className="relative">
                                                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16}/>
                                                <input 
                                                    type="text" 
                                                    value={weather} 
                                                    onChange={e => setWeather(e.target.value)}
                                                    placeholder="e.g. Rainy, 45F, High Wind"
                                                    className="w-full pl-10 p-3 bg-black/40 border border-white/10 rounded text-sm text-white focus:border-yellow-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-2">Work Activity</label>
                                            <div className="relative">
                                                <Hammer className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16}/>
                                                <input 
                                                    type="text" 
                                                    value={workType} 
                                                    onChange={e => setWorkType(e.target.value)}
                                                    placeholder="e.g. Trench Excavation > 5ft"
                                                    className="w-full pl-10 p-3 bg-black/40 border border-white/10 rounded text-sm text-white focus:border-yellow-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleGenerateBriefing}
                                            disabled={isGeneratingBriefing || !weather || !workType}
                                            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase text-xs tracking-wider rounded flex items-center justify-center gap-2 transition-colors disabled:bg-neutral-800 disabled:text-neutral-500"
                                        >
                                            {isGeneratingBriefing ? <Loader2 size={16} className="animate-spin"/> : <FileText size={16}/>} Generate Script
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 bg-[var(--bg-card)] border border-white/10 rounded-sm p-8 relative overflow-hidden">
                                {briefingText ? (
                                    <div className="relative z-10 prose prose-invert max-w-none">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                                             <div className="text-xl font-bold text-yellow-500 uppercase tracking-tight">Tailgate Safety Meeting</div>
                                             <div className="text-[10px] font-mono text-neutral-500">Generated by ACME Safety AI</div>
                                        </div>
                                        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-neutral-300">
                                            {briefingText}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600">
                                        <ShieldAlert size={64} className="mb-4 opacity-20"/>
                                        <p className="font-mono text-xs uppercase tracking-widest">Awaiting Input Parameters</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none z-0"></div>
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* NEW INCIDENT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-red-500/50 rounded-sm shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 bg-[var(--bg-main)] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertOctagon size={24} className="text-red-500"/> Report Incident
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-white"><X size={24}/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block mb-1">Title</label>
                                     <input required type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full p-3 bg-black/40 border border-white/10 rounded text-white text-sm focus:border-red-500 focus:outline-none"/>
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block mb-1">Location</label>
                                     <input required type="text" value={formLocation} onChange={e => setFormLocation(e.target.value)} className="w-full p-3 bg-black/40 border border-white/10 rounded text-white text-sm focus:border-red-500 focus:outline-none"/>
                                 </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block mb-1">Type</label>
                                     <select value={formType} onChange={e => setFormType(e.target.value as IncidentType)} className="w-full p-3 bg-black/40 border border-white/10 rounded text-white text-sm focus:border-red-500 focus:outline-none">
                                         <option value="NEAR_MISS">Near Miss</option>
                                         <option value="INJURY">Injury</option>
                                         <option value="PROPERTY_DAMAGE">Property Damage</option>
                                         <option value="ENVIRONMENTAL">Environmental</option>
                                     </select>
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block mb-1">Severity</label>
                                     <select value={formSeverity} onChange={e => setFormSeverity(e.target.value as IncidentSeverity)} className="w-full p-3 bg-black/40 border border-white/10 rounded text-white text-sm focus:border-red-500 focus:outline-none">
                                         <option value="LOW">Low</option>
                                         <option value="MEDIUM">Medium</option>
                                         <option value="HIGH">High</option>
                                         <option value="CRITICAL">Critical</option>
                                     </select>
                                 </div>
                             </div>

                             <div>
                                 <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block mb-1">Description</label>
                                 <textarea required rows={4} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-3 bg-black/40 border border-white/10 rounded text-white text-sm focus:border-red-500 focus:outline-none resize-none" placeholder="Describe what happened..."/>
                             </div>

                             {/* AI Analysis Section */}
                             <div className="border-t border-white/10 pt-4">
                                 {!aiAnalysisResult ? (
                                     <button 
                                        type="button" 
                                        onClick={handleAnalyze} 
                                        disabled={isAnalyzing || !formDesc}
                                        className="w-full py-2 bg-[rgba(0,49,83,0.4)] hover:bg-[rgba(0,49,83,0.6)] border border-[var(--navy)]/50 rounded text-white/70 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                     >
                                         {isAnalyzing ? <Loader2 size={14} className="animate-spin"/> : <Bot size={14}/>} Analyze Root Cause with AI
                                     </button>
                                 ) : (
                                     <div className="bg-[rgba(0,49,83,0.1)] border border-[var(--navy)]/30 rounded p-4">
                                         <div className="flex justify-between items-center mb-2">
                                             <div className="text-xs font-bold text-[var(--navy)] uppercase">AI Analysis Report</div>
                                             <button type="button" onClick={() => setAiAnalysisResult('')} className="text-[10px] text-neutral-500 hover:text-white">Clear</button>
                                         </div>
                                         <div className="text-xs text-white/90 font-mono whitespace-pre-wrap">{aiAnalysisResult}</div>
                                     </div>
                                 )}
                             </div>

                             <div className="flex justify-end pt-4 border-t border-white/10">
                                 <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold uppercase text-xs tracking-wider">Submit Report</button>
                             </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component for location icon used in table
const MapPinIcon = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
