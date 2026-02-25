
import React, { useState, useEffect } from 'react';
import { StandardCard, ElementType } from '../types';
import { SUB_CATEGORIES } from '../constants';
import { X, Save, FileText, Tag, Layers, AlertCircle } from 'lucide-react';

interface StandardFormModalProps {
  mode: 'CREATE' | 'EDIT';
  initialData?: StandardCard;
  category: ElementType; // Current active category
  onClose: () => void;
  onSave: (data: Partial<StandardCard>) => void;
}

export const StandardFormModal: React.FC<StandardFormModalProps> = ({ 
  mode, 
  initialData, 
  category, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<StandardCard>>({
    title: '',
    description: '',
    category: category,
    subCategory: SUB_CATEGORIES[category][1] || 'GENERAL', // Default to first real subcat
    filename: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (!formData.filename?.trim()) newErrors.filename = "Filename is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#18181b] border border-indigo-500/50 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
        
        {/* Top Accent */}
        <div className="h-1 w-full bg-indigo-600"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#121212] flex justify-between items-center">
          <div>
            <div className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest mb-1">
              System Entry Terminal
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {mode === 'CREATE' ? 'Initialize New Standard' : 'Modify Existing Record'}
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          {/* Category Read-only */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5 opacity-60 cursor-not-allowed">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                   <Layers size={10} /> Category
                </label>
                <div className="p-2.5 bg-black/40 border border-white/10 rounded text-sm text-neutral-300 font-mono">
                   {formData.category}
                </div>
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                   <Tag size={10} /> Sub-Category
                </label>
                <select 
                   value={formData.subCategory}
                   onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                   className="w-full p-2.5 bg-[#09090b] border border-white/10 rounded text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
                >
                   {SUB_CATEGORIES[category].filter(sc => sc !== 'ALL').map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                   ))}
                </select>
             </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                Standard Title <span className="text-red-500">*</span>
             </label>
             <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Manhole - Storm - 48 inch"
                className={`w-full p-3 bg-[#09090b] border rounded text-sm text-white focus:outline-none transition-colors font-medium ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
             />
             {errors.title && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10}/> {errors.title}</span>}
          </div>

          {/* Filename */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                <FileText size={10} /> Source Filename <span className="text-red-500">*</span>
             </label>
             <input 
                type="text"
                value={formData.filename}
                onChange={(e) => setFormData({...formData, filename: e.target.value})}
                placeholder="e.g. STRM-MH-48.dwg"
                className={`w-full p-3 bg-[#09090b] border rounded text-sm text-white focus:outline-none transition-colors font-mono ${errors.filename ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
             />
             {errors.filename && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10}/> {errors.filename}</span>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                Technical Description <span className="text-red-500">*</span>
             </label>
             <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe usage, constraints, and applicable standards..."
                className={`w-full p-3 bg-[#09090b] border rounded text-sm text-white focus:outline-none transition-colors leading-relaxed resize-none custom-scrollbar ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
             />
             {errors.description && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10}/> {errors.description}</span>}
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-6 bg-[#121212] border-t border-white/10 flex justify-end gap-3">
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
              {mode === 'CREATE' ? 'Initialize' : 'Save Changes'}
           </button>
        </div>

      </div>
    </div>
  );
};
