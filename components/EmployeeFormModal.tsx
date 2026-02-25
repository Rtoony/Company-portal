
import React, { useState } from 'react';
import { Employee, EmployeeStatus } from '../types';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { X, Save, User, Briefcase, MapPin, Mail, Phone, AlertCircle, Wrench, Sparkles, Wand2, Loader2, Bot, Dice5 } from 'lucide-react';

interface EmployeeFormModalProps {
  mode: 'CREATE' | 'EDIT';
  initialData?: Employee;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ 
  mode, 
  initialData, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    title: '',
    department: 'Engineering',
    status: 'ACTIVE',
    email: '',
    phone: '',
    location: '',
    skills: [],
    avatarUrl: '',
    ...initialData
  });

  const [skillsInput, setSkillsInput] = useState(initialData?.skills.join(', ') || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Avatar Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorPrompt, setGeneratorPrompt] = useState("");
  const [generateIdentity, setGenerateIdentity] = useState(false);
  const [genStatus, setGenStatus] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const processedSkills = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      onSave({
          ...formData,
          skills: processedSkills
      });
    }
  };

  const handleGeneratorToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowGenerator(!showGenerator);
  };

  // Helper to safely parse AI JSON with Markdown stripping and substring extraction
  const parseAIJson = (text: string) => {
      try {
          let cleaned = text.trim();
          // Remove markdown code blocks if present
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          
          // Safety: extract just the JSON object if there is extra text
          const firstBrace = cleaned.indexOf('{');
          const lastBrace = cleaned.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
             cleaned = cleaned.substring(firstBrace, lastBrace + 1);
          }

          return JSON.parse(cleaned);
      } catch (e) {
          console.error("JSON Parse Error", e);
          return null;
      }
  };

  const handleGenerate = async (isRandom: boolean) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("System Error: API Key missing.");
      return;
    }

    setIsGenerating(true);
    setGenStatus("Initializing Protocol...");
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Define Department Visual Themes & Props (Strict Mandates)
      const deptConfig: Record<string, { theme: string, props: string }> = {
          'Engineering': {
              theme: 'Cobalt Blue & White. Clean, technical office lighting.',
              props: 'Holding rolled blueprints, a digital tablet, or wearing a white hard hat.'
          },
          'Surveying': {
              theme: 'Safety Orange & Earth Tones. Outdoor, rugged sunlight.',
              props: 'Wearing a high-vis safety vest, holding a red and white survey prism pole or GPS rover.'
          },
          'Admin': {
              theme: 'Gold & Charcoal. Sharp professional studio lighting.',
              props: 'Holding a clipboard, wearing a headset, or organizing file folders.'
          },
          'GIS': {
              theme: 'Cyan & Purple Neon. Cyber/Data center glow.',
              props: 'Wearing smart glasses, holding a holographic data pad, or sitting at a multi-monitor station.'
          },
          'Management': {
              theme: 'Platinum & Navy. Executive, dramatic lighting.',
              props: 'Wearing a sharp suit, arms crossed confidently, or holding a coffee mug.'
          }
      };

      // 1. Determine Identity (Either use existing form data OR generate new)
      let persona = {
          name: formData.name,
          title: formData.title,
          department: formData.department || 'Engineering',
          visualDescription: generatorPrompt || "Standard professional attire suitable for the role.",
          temperament: "Confident"
      };

      if (generateIdentity || isRandom) {
          setGenStatus("Fabricating Identity...");
          
          const identityPrompt = `
            Act as a Creative HR Director for 'ACME Civil Engineering'. 
            Create a unique, professional employee persona.
            ${!isRandom && generatorPrompt ? `Constraint: Base the character on this concept: "${generatorPrompt}"` : 'Constraint: Create a completely random character.'}
            
            Return a valid JSON object (NO MARKDOWN) with these exact keys:
            - name: Full Name
            - title: Job Title (e.g. Senior Surveyor, CAD Tech, GIS Analyst, Civil Engineer)
            - department: One of [Engineering, Surveying, Admin, GIS, Management]
            - skills: Array of 3 specific technical skills (e.g. AutoCAD, LiDAR, Excel, Python)
            - email: Professional email ending in acme.com
            - phone: Extension (e.g. x104)
            - location: Office location (e.g. Office 304) or Field Site
            - temperament: One word adjective describing their facial expression (e.g. Grumpy, Cheerful, Stoic, Nervous, Stern, Sleepy, Skeptical, Enthusiastic).
            - visualDescription: A short description of their clothing style only. Do not describe props here.
          `;

          const textResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: identityPrompt,
              config: { 
                  responseMimeType: 'application/json' 
              }
          });

          const generatedData = parseAIJson(textResponse.text || "{}");
          
          if (generatedData && generatedData.name) {
              // Robust Department Normalization
              const rawDept = generatedData.department || 'Engineering';
              // Find matching key case-insensitive (handles "Surveying Department" vs "Surveying")
              const matchedDept = Object.keys(deptConfig).find(k => 
                  rawDept.toLowerCase().includes(k.toLowerCase())
              ) || 'Engineering';

              persona = { 
                  ...generatedData, 
                  department: matchedDept,
                  temperament: generatedData.temperament || "Professional" 
              };
              
              // Update Form
              setFormData(prev => ({
                  ...prev,
                  name: generatedData.name,
                  title: generatedData.title,
                  department: matchedDept as any,
                  email: generatedData.email,
                  phone: generatedData.phone,
                  location: generatedData.location,
                  skills: generatedData.skills
              }));
              setSkillsInput(generatedData.skills?.join(', ') || '');
          }
      }

      // 2. Generate Image based on Persona
      setGenStatus("Rendering Asset...");

      // Re-evaluate department settings based on final persona
      const finalDept = persona.department || 'Engineering';
      const normalizedDeptKey = Object.keys(deptConfig).find(k => finalDept.toLowerCase().includes(k.toLowerCase())) || 'Engineering';
      const deptSettings = deptConfig[normalizedDeptKey];

      const stylePrompt = `
        Generate a high-fidelity 3D character avatar of a ${persona.title}.
        
        CHARACTER TRAITS:
        - Expression: ${persona.temperament} (Make the facial expression exaggerated and full of personality).
        - Attire: ${persona.visualDescription}
        - MANDATORY PROPS: ${deptSettings.props} (Character MUST be interacting with these items or have them clearly visible).
        
        VISUAL STYLE (THE UNIVERSE):
        - Style: Stylized 3D Character Art (Hero Shooter / Collectible Vinyl Toy aesthetic).
        - Rendering: Octane Render, consistent studio lighting, ambient occlusion.
        - Texture: Smooth, clean, slightly stylized textures (like a high-end action figure). Subsurface scattering on skin.
        - Lighting: Dramatic rim lighting matching the department color: ${deptSettings.theme}.
        - Background: Abstract gradient or solid color based on ${deptSettings.theme}. Simple and clean to act as an icon.
        - Composition: Bust shot (chest up), facing forward, looking at camera.
        
        NEGATIVE PROMPTS:
        - photorealistic, hyperrealistic, grainy, noise, pixelated, 2d, illustration, painting, drawing, sketch, anime, text, watermark, logo, bad anatomy, distorted face, creepy eyes, complex background, busy background, multiple characters, uncanny valley, deformed fingers.
      `;

      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: stylePrompt }] },
        config: {
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        }
      });

      let imageBase64 = null;
      if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            imageBase64 = part.inlineData.data;
            break;
          }
        }
      }

      if (imageBase64) {
        setFormData(prev => ({ ...prev, avatarUrl: `data:image/png;base64,${imageBase64}` }));
      }

    } catch (error) {
      console.error("Generator failed", error);
      alert("Generator malfunction. Try again.");
    } finally {
      setIsGenerating(false);
      setGenStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#18181b] border border-indigo-500/50 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative max-h-[90vh]">
        
        {/* Top Accent */}
        <div className="h-1 w-full bg-emerald-500"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#121212] flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest mb-1">
              HR Data Terminal
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {mode === 'CREATE' ? 'Onboard New Personnel' : 'Update Service Record'}
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* --- TOP SECTION: AVATAR & IDENTITY --- */}
          <div className="flex gap-6 mb-2">
            
            {/* Left: Avatar Control */}
            <div className="shrink-0">
               <div className="relative group w-24 h-24 rounded bg-neutral-800 border border-white/10 overflow-hidden shadow-inner">
                  {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          <User size={32} />
                      </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button 
                        type="button"
                        onClick={handleGeneratorToggle}
                        className="p-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                        title="Open Personnel Generator"
                      >
                         <Wand2 size={14} />
                      </button>
                  </div>

                  {isGenerating && (
                      <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20 flex-col p-1">
                          <Loader2 size={24} className="text-emerald-500 animate-spin mb-2" />
                          <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest text-center leading-tight">
                              {genStatus || 'Processing'}
                          </span>
                      </div>
                  )}
               </div>
               <div className="text-[9px] text-center mt-2 text-neutral-500 font-mono">ID PHOTO</div>
            </div>

            {/* Right: Primary Fields */}
            <div className="flex-1 space-y-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Full Name <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full p-2 bg-[#09090b] border rounded text-sm text-white focus:outline-none transition-colors font-bold ${errors.name ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
                        placeholder="e.g. John Doe"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Job Title <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className={`w-full p-2 bg-[#09090b] border rounded text-sm text-white focus:outline-none transition-colors ${errors.title ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
                        placeholder="e.g. Senior Surveyor"
                    />
                </div>
            </div>
          </div>

          {/* --- PERSONNEL GENERATOR UI --- */}
          {showGenerator && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 mb-4 animate-in slide-in-from-top-2 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3 relative z-10">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                          <Sparkles size={14} className="fill-indigo-500" /> Personnel Generator
                      </div>
                      <button type="button" onClick={() => setShowGenerator(false)} className="text-neutral-500 hover:text-white"><X size={14}/></button>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                      {/* Mode Toggle */}
                      <div className="flex gap-2 p-1 bg-black/40 rounded border border-white/10">
                          <button 
                            type="button"
                            onClick={() => setGenerateIdentity(false)}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-colors ${!generateIdentity ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:text-white'}`}
                          >
                              Image Only
                          </button>
                          <button 
                            type="button"
                            onClick={() => setGenerateIdentity(true)}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-colors ${generateIdentity ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:text-white'}`}
                          >
                              Full Identity
                          </button>
                      </div>

                      <div>
                          <label className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                              {generateIdentity ? "Concept / Temperament / Role" : "Visual Description"}
                          </label>
                          <input 
                              type="text" 
                              value={generatorPrompt}
                              onChange={(e) => setGeneratorPrompt(e.target.value)}
                              placeholder={generateIdentity ? "e.g. Grumpy surveyor who loves coffee..." : "e.g. Wearing a safety vest, holding a prism pole..."}
                              className="w-full p-2 bg-black/40 border border-white/10 rounded text-xs text-white focus:border-indigo-500 focus:outline-none placeholder:text-neutral-600"
                          />
                      </div>
                      
                      <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => handleGenerate(false)}
                            disabled={isGenerating || (!generatorPrompt && !generateIdentity)}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-indigo-500/50"
                          >
                              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
                              Generate
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleGenerate(true)}
                            disabled={isGenerating}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-emerald-500/50"
                          >
                              <Dice5 size={12} />
                              Surprise Me
                          </button>
                      </div>
                      <p className="text-[9px] text-neutral-500 italic text-center mt-1">
                          *Generates consistent 'Semi-Realistic 3D Cartoon' avatars.
                      </p>
                  </div>
                  
                  {/* Background Accents */}
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-500/20 blur-xl rounded-full pointer-events-none"></div>
              </div>
          )}

          {/* Department & Status */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                   <Briefcase size={10} /> Department
                </label>
                <select 
                   value={formData.department}
                   onChange={(e) => setFormData({...formData, department: e.target.value as any})}
                   className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer"
                >
                   <option value="Engineering">Engineering</option>
                   <option value="Surveying">Surveying</option>
                   <option value="Admin">Admin</option>
                   <option value="GIS">GIS</option>
                   <option value="Management">Management</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                   <AlertCircle size={10} /> Status
                </label>
                <select 
                   value={formData.status}
                   onChange={(e) => setFormData({...formData, status: e.target.value as EmployeeStatus})}
                   className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer"
                >
                   <option value="ACTIVE">ACTIVE</option>
                   <option value="FIELD">FIELD</option>
                   <option value="REMOTE">REMOTE</option>
                   <option value="LEAVE">LEAVE</option>
                   <option value="MEETING">MEETING</option>
                </select>
             </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                   <Mail size={10} /> Email
                </label>
                <input 
                   type="email"
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   placeholder="user@acme.com"
                   className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                   <Phone size={10} /> Phone Ext
                </label>
                <input 
                   type="text"
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   placeholder="x100"
                   className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
             </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                <MapPin size={10} /> Physical Location
             </label>
             <input 
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Office 204 or 'Site: Smith Creek'"
                className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
             />
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                <Wrench size={10} /> Skills / Expertise
             </label>
             <textarea 
                rows={2}
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Comma separated: AutoCAD, Hydrology, Drone Pilot..."
                className="w-full p-3 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
             />
          </div>

        </form>

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
              className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
           >
              <Save size={14} />
              {mode === 'CREATE' ? 'Confirm Hire' : 'Save Changes'}
           </button>
        </div>

      </div>
    </div>
  );
};
