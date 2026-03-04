
import React, { useState } from 'react';
import { Project } from '../types';
import { generateTransmittal } from '../services/geminiService';
import { X, FileText, Bot, Copy, Check, Sparkles, Loader2, Printer, Download } from 'lucide-react';

interface TransmittalModalProps {
  project: Project;
  onClose: () => void;
}

export const TransmittalModal: React.FC<TransmittalModalProps> = ({ project, onClose }) => {
  const [docType, setDocType] = useState('Transmittal');
  const [recipient, setRecipient] = useState('');
  const [contentItems, setContentItems] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
      if (!recipient || !contentItems) {
          alert("Please fill in recipient and items.");
          return;
      }
      setIsGenerating(true);
      try {
          const text = await generateTransmittal(project, docType, recipient, contentItems);
          setGeneratedText(text);
      } catch (e) {
          alert("Generation failed.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--navy)]/50 rounded-sm shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[var(--bg-main)] flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] font-mono font-bold text-[var(--navy)] uppercase tracking-widest mb-1">
              Document Engine
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot size={20}/> AI Transmittal Generator
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Left: Controls */}
            <div className="w-1/3 bg-[var(--bg-main)] border-r border-white/10 p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                
                <div className="p-3 bg-white/5 border border-white/10 rounded">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Project Context</div>
                    <div className="text-sm font-bold text-white truncate">{project.name}</div>
                    <div className="text-xs text-[var(--navy)] font-mono">{project.id}</div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Document Type</label>
                    <select 
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full p-2.5 bg-[var(--bg-card)] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-[var(--navy)]"
                    >
                        <option value="Transmittal">Letter of Transmittal</option>
                        <option value="RFI">Request for Info (RFI)</option>
                        <option value="Proposal">Scope Proposal</option>
                        <option value="Memo">Internal Memo</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Recipient Name/Firm</label>
                    <input 
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="e.g. John Doe, City Planning"
                        className="w-full p-2.5 bg-[var(--bg-card)] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-[var(--navy)]"
                    />
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Items / Subject Matter</label>
                    <textarea 
                        value={contentItems}
                        onChange={(e) => setContentItems(e.target.value)}
                        placeholder="e.g. 3 sets of Improvement Plans, Hydrology Report. Please review for permit..."
                        className="w-full flex-1 p-2.5 bg-[var(--bg-card)] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-[var(--navy)] resize-none"
                    />
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-3 bg-[var(--navy)] hover:bg-[var(--navy)] disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                    {isGenerating ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />}
                    Generate Document
                </button>
            </div>

            {/* Right: Preview */}
            <div className="flex-1 bg-[var(--bg-main)] flex flex-col relative">
                {generatedText ? (
                    <>
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white text-black font-serif text-sm leading-relaxed whitespace-pre-wrap shadow-inner relative z-10 mx-auto w-full max-w-[210mm] my-4">
                            {generatedText}
                        </div>
                        <div className="p-4 bg-[var(--bg-card)] border-t border-white/10 flex justify-end gap-3 z-20">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-400 rounded flex items-center gap-2 text-xs font-bold uppercase">
                                <Printer size={14}/> Print
                            </button>
                            <button 
                                onClick={handleCopy}
                                className={`
                                    px-4 py-2 rounded flex items-center gap-2 text-xs font-bold uppercase transition-colors
                                    ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-neutral-200'}
                                `}
                            >
                                {copied ? <Check size={14}/> : <Copy size={14}/>}
                                {copied ? 'Copied' : 'Copy Text'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 opacity-50">
                        <FileText size={48} className="mb-4"/>
                        <p>Fill form to generate document preview</p>
                    </div>
                )}
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none z-0"></div>
            </div>
        </div>

      </div>
    </div>
  );
};
