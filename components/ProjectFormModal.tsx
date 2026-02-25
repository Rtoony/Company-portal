
import React, { useState } from 'react';
import { Project, ProjectStatus, LogType, ProjectLogEntry } from '../types';
import { X, Save, Briefcase, MapPin, Calendar, Activity, AlertCircle, FileText, Bot, Sparkles, Loader2, Zap, Hash, Plus, MessageSquare, AlertTriangle, Users, Navigation } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface ProjectFormModalProps {
  mode: 'CREATE' | 'EDIT';
  initialData?: Project;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ 
  mode, 
  initialData, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    client: '',
    location: '',
    status: 'ACTIVE',
    phase: 'Design Development',
    progress: 0,
    dueDate: '',
    description: '',
    tags: [],
    logs: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  
  // Log State
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'LOGS'>('DETAILS');
  const [newLogContent, setNewLogContent] = useState("");
  const [newLogType, setNewLogType] = useState<LogType>('UPDATE');

  // AI Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectPrompt, setProjectPrompt] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Project Name is required";
    if (!formData.client?.trim()) newErrors.client = "Client is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleAddTag = () => {
      if (tagInput.trim()) {
          const newTags = [...(formData.tags || [])];
          if (!newTags.includes(tagInput.trim())) {
              newTags.push(tagInput.trim());
              setFormData({ ...formData, tags: newTags });
          }
          setTagInput("");
      }
  };

  const handleRemoveTag = (tagToRemove: string) => {
      setFormData({
          ...formData,
          tags: (formData.tags || []).filter(t => t !== tagToRemove)
      });
  };

  const handleAddLog = () => {
      if (!newLogContent.trim()) return;
      const newEntry: ProjectLogEntry = {
          id: `log-${Date.now()}`,
          date: new Date().toISOString(),
          content: newLogContent,
          type: newLogType,
          author: 'Current User' // In real app, use auth context
      };
      setFormData({
          ...formData,
          logs: [newEntry, ...(formData.logs || [])]
      });
      setNewLogContent("");
  };

  const parseGenAIJson = (text: string | undefined) => {
      if (!text) return {};
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
      
      try {
          // Robust substring extraction
          const firstBrace = cleaned.indexOf('{');
          const lastBrace = cleaned.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
             cleaned = cleaned.substring(firstBrace, lastBrace + 1);
          }
          return JSON.parse(cleaned);
      } catch (e) {
          console.error("JSON Parse Error:", e);
          return {};
      }
  };

  const handleGenerateProject = async () => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
          alert("API Key missing. Cannot access Genesis Engine.");
          return;
      }
      if (!projectPrompt.trim()) {
          alert("Please enter a project concept first.");
          return;
      }

      setIsGenerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey });
          
          const systemInstruction = `You are a Senior Project Manager at ACME Civil Engineering. 
          Generate a detailed project scope based on a rough concept.
          Tone: Professional, technical, but creative. Use industry terminology (grading, swale, retention, right-of-way).`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Generate a civil engineering project based on this concept: "${projectPrompt}".
              
              Return JSON with:
              1. name: A catchy but professional project name (e.g. "Coyote Creek Rehabilitation").
              2. client: A realistic corporate or municipal client name.
              3. location: A plausible city/state.
              4. phase: Current project phase (e.g. "Permitting", "Design", "Construction").
              5. tags: 3-4 short tags (e.g. "Water", "Structural").
              6. description: A 2-3 sentence professional scope of work description.
              `,
              config: {
                  systemInstruction,
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING },
                          client: { type: Type.STRING },
                          location: { type: Type.STRING },
                          phase: { type: Type.STRING },
                          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                          description: { type: Type.STRING }
                      },
                      required: ["name", "client", "location", "phase", "description"]
                  }
              }
          });

          // Corrected to use response.text directly
          const json = parseGenAIJson(response.text);

          if (json.name) {
              setFormData(prev => ({
                  ...prev,
                  name: json.name,
                  client: json.client,
                  location: json.location,
                  phase: json.phase,
                  description: json.description,
                  tags: json.tags || [],
                  status: 'ACTIVE', // Default
                  progress: 10 // Default start
              }));
          }

      } catch (error) {
          console.error("Project Generation Failed", error);
          alert("Genesis Engine malfunction.");
      } finally {
          setIsGenerating(false);
          setShowGenerator(false); // Close generator on success to show filled form
      }
  };

  const getLogIcon = (type: LogType) => {
      switch(type) {
          case 'UPDATE': return <MessageSquare size={14} className="text-blue-400"/>;
          case 'ISSUE': return <AlertTriangle size={14} className="text-amber-500"/>;
          case 'MEETING': return <Users size={14} className="text-purple-400"/>;
          case 'FIELD': return <Navigation size={14} className="text-emerald-400"/>;
      }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#18181b] border border-indigo-500/50 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative max-h-[90vh]">
        
        {/* Top Accent */}
        <div className="h-1 w-full bg-indigo-600"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#121212] flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest mb-1">
              Job Control
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {mode === 'CREATE' ? 'Open New Job Number' : 'Modify Project Record'}
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        {mode === 'EDIT' && (
            <div className="flex border-b border-white/10 bg-[#09090b]">
                <button 
                    onClick={() => setActiveTab('DETAILS')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'DETAILS' ? 'text-white bg-[#18181b] border-t-2 border-indigo-500' : 'text-neutral-500 hover:bg-white/5'}`}
                >
                    Project Details
                </button>
                <button 
                    onClick={() => setActiveTab('LOGS')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'LOGS' ? 'text-white bg-[#18181b] border-t-2 border-emerald-500' : 'text-neutral-500 hover:bg-white/5'}`}
                >
                    Event Log ({formData.logs?.length || 0})
                </button>
            </div>
        )}

        {/* Body */}
        {activeTab === 'DETAILS' ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            
            {/* AI Generator Toggle */}
            <div className="mb-4">
                {!showGenerator ? (
                    <button 
                        type="button"
                        onClick={() => setShowGenerator(true)}
                        className="w-full py-3 bg-gradient-to-r from-indigo-900/40 to-black border border-indigo-500/30 rounded flex items-center justify-center gap-2 text-indigo-300 font-bold uppercase text-xs tracking-wider hover:border-indigo-400 hover:text-white transition-all group"
                    >
                        <Sparkles size={14} /> Open Genesis Engine
                    </button>
                ) : (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded p-4 animate-in slide-in-from-top-2 relative">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                                <Zap size={14} className="fill-indigo-500" /> Project Genesis
                            </div>
                            <button type="button" onClick={() => setShowGenerator(false)} className="text-neutral-500 hover:text-white"><X size={14}/></button>
                        </div>
                        <p className="text-[10px] text-neutral-400 mb-3">
                            Enter a vague concept and the AI will generate a full professional scope, client, and project details.
                        </p>
                        <textarea 
                            value={projectPrompt}
                            onChange={(e) => setProjectPrompt(e.target.value)}
                            placeholder="e.g. Build a luxury hotel on Mars..."
                            className="w-full p-3 bg-black/40 border border-white/10 rounded text-xs text-white placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-none resize-none mb-3"
                            rows={2}
                        />
                        <button 
                            type="button"
                            onClick={handleGenerateProject}
                            disabled={isGenerating}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
                        >
                            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                            Generate Scope
                        </button>
                    </div>
                )}
            </div>

            {/* ID Display (Read Only) */}
            {mode === 'EDIT' && (
                <div className="p-2 bg-white/5 border border-white/10 rounded flex justify-between items-center">
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Job Number</span>
                    <span className="text-sm font-mono text-white font-bold">{initialData?.id}</span>
                </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                    <Briefcase size={10} /> Project Name <span className="text-red-500">*</span>
                </label>
                <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Smith Creek Subdivision"
                    className={`w-full p-3 bg-[#09090b] border rounded text-sm text-white focus:outline-none transition-colors font-bold ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
                />
                {errors.name && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10}/> {errors.name}</span>}
            </div>

            {/* Client & Location */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                    Client <span className="text-red-500">*</span>
                    </label>
                    <input 
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    placeholder="Client Name"
                    className={`w-full p-3 bg-[#09090b] border rounded text-sm text-white focus:outline-none transition-colors ${errors.client ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                    <MapPin size={10} /> Location
                    </label>
                    <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, State"
                    className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                    <FileText size={10} /> Scope Description
                </label>
                <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief project scope and details..."
                    className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                    <Hash size={10} /> Project Tags
                </label>
                <div className="p-3 bg-[#09090b] border border-white/10 rounded">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags?.map((tag, idx) => (
                            <span key={idx} className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="hover:text-white"><X size={10}/></button>
                            </span>
                        ))}
                        {(!formData.tags || formData.tags.length === 0) && (
                            <span className="text-neutral-600 text-xs italic">No tags added.</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Add new tag..."
                            className="flex-1 bg-black/40 border-b border-white/10 text-xs text-white p-1 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button 
                            type="button"
                            onClick={handleAddTag}
                            className="p-1 text-neutral-400 hover:text-white"
                        >
                            <Plus size={14}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Status & Due Date */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                    <Activity size={10} /> Status
                    </label>
                    <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ProjectStatus})}
                    className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
                    >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="HOLD">HOLD</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="BIDDING">BIDDING</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                    <Calendar size={10} /> Due Date
                    </label>
                    <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Phase */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                    Current Phase
                </label>
                <input 
                    type="text"
                    value={formData.phase}
                    onChange={(e) => setFormData({...formData, phase: e.target.value})}
                    placeholder="e.g. Construction Documents"
                    className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
            </div>

            {/* Progress Slider */}
            <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Completion</label>
                    <span className="text-xs font-mono text-indigo-400 font-bold">{formData.progress}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={formData.progress} 
                    onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>

            </form>
        ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">
                {/* Log List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {formData.logs && formData.logs.length > 0 ? (
                        formData.logs.map((log) => (
                            <div key={log.id} className="flex gap-4 group">
                                <div className="flex flex-col items-center gap-1 pt-1">
                                    <div className="w-6 h-6 rounded bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0">
                                        {getLogIcon(log.type)}
                                    </div>
                                    <div className="w-px h-full bg-white/5 group-last:hidden"></div>
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-[10px] font-mono text-neutral-500">{new Date(log.date).toLocaleString()}</div>
                                        <div className="text-[9px] font-bold uppercase bg-white/5 px-1.5 py-0.5 rounded text-neutral-400">{log.type}</div>
                                    </div>
                                    <div className="text-sm text-neutral-300 leading-relaxed bg-[#18181b] p-3 rounded border border-white/5">
                                        {log.content}
                                    </div>
                                    <div className="text-[10px] text-neutral-600 mt-1 pl-1">Author: {log.author}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-neutral-600">
                            <Activity size={32} className="mx-auto mb-2 opacity-20"/>
                            <p className="text-xs font-mono">No entries recorded in War Room Log.</p>
                        </div>
                    )}
                </div>

                {/* Add Entry */}
                <div className="p-4 bg-[#121212] border-t border-white/10 space-y-3">
                    <div className="flex gap-2">
                        <select 
                            value={newLogType}
                            onChange={(e) => setNewLogType(e.target.value as LogType)}
                            className="bg-[#18181b] border border-white/10 rounded text-[10px] font-bold uppercase text-white p-2 focus:outline-none"
                        >
                            <option value="UPDATE">Update</option>
                            <option value="ISSUE">Issue</option>
                            <option value="FIELD">Field</option>
                            <option value="MEETING">Meeting</option>
                        </select>
                        <input 
                            type="text" 
                            value={newLogContent}
                            onChange={(e) => setNewLogContent(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLog()}
                            placeholder="Enter new log entry..."
                            className="flex-1 bg-[#18181b] border border-white/10 rounded text-sm text-white px-3 focus:border-indigo-500 focus:outline-none"
                        />
                        <button 
                            onClick={handleAddLog}
                            disabled={!newLogContent.trim()}
                            className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 text-white rounded transition-colors"
                        >
                            <Plus size={16}/>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 bg-[#121212] border-t border-white/10 flex justify-end gap-3 shrink-0">
           <button 
              onClick={onClose}
              className="px-4 py-2 rounded border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-wider"
           >
              Cancel
           </button>
           <button 
              onClick={handleSubmit}
              className="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
           >
              <Save size={14} />
              {mode === 'CREATE' ? 'Initialize Job' : 'Update Record'}
           </button>
        </div>

      </div>
    </div>
  );
};
