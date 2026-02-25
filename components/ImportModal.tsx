
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, AlertCircle, Database, Download, ArrowRight, AlertTriangle } from 'lucide-react';
import { StandardCard, ElementType } from '../types';
import { THEMES, SUB_CATEGORIES } from '../constants';

interface ImportModalProps {
  onClose: () => void;
  onImport: (data: Partial<StandardCard>[]) => Promise<void>;
}

// Helper to validate if a string is a valid ElementType
const isValidCategory = (cat: string): boolean => {
    return Object.values(ElementType).includes(cat as ElementType);
};

// Helper to validate subcategory
const isValidSubCategory = (cat: string, subCat: string): boolean => {
    if (!isValidCategory(cat)) return false;
    const validSubs = SUB_CATEGORIES[cat as ElementType] || [];
    return validSubs.includes(subCat);
};

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Partial<StandardCard>[]>([]);
  const [validationIssues, setValidationIssues] = useState<number>(0);
  const [isParsing, setIsParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Robust CSV Parser (Handles Quotes and Escapes)
  const parseCSV = async (text: string) => {
      setIsParsing(true);
      setValidationIssues(0);
      try {
          // Normalize line endings
          const rawText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          
          const rows: string[][] = [];
          let currentRow: string[] = [];
          let currentVal = '';
          let inQuote = false;
          
          for (let i = 0; i < rawText.length; i++) {
              const char = rawText[i];
              const nextChar = rawText[i + 1];

              if (inQuote) {
                  if (char === '"' && nextChar === '"') {
                      currentVal += '"'; // Escaped quote
                      i++; // Skip next
                  } else if (char === '"') {
                      inQuote = false; // End quote
                  } else {
                      currentVal += char;
                  }
              } else {
                  if (char === '"') {
                      inQuote = true;
                  } else if (char === ',') {
                      currentRow.push(currentVal.trim());
                      currentVal = '';
                  } else if (char === '\n') {
                      currentRow.push(currentVal.trim());
                      if (currentRow.some(c => c.length > 0)) rows.push(currentRow);
                      currentRow = [];
                      currentVal = '';
                  } else {
                      currentVal += char;
                  }
              }
          }
          // Push last row if exists
          if (currentVal || currentRow.length > 0) {
              currentRow.push(currentVal.trim());
              rows.push(currentRow);
          }

          if (rows.length < 2) throw new Error("File is empty or missing headers");

          // Map Headers
          const headers = rows[0].map(h => h.toLowerCase());
          const data: Partial<StandardCard>[] = [];
          let issues = 0;
          
          for (let i = 1; i < rows.length; i++) {
              const cols = rows[i];
              if (cols.length < headers.length) continue;

              const row: any = {};
              headers.forEach((header, idx) => {
                  row[header] = cols[idx];
              });

              // Validation & Normalization
              let categoryStr = (row['category'] || '').toUpperCase();
              let subCategoryStr = (row['subcategory'] || 'GENERAL').toUpperCase();
              
              // Check validity
              const categoryValid = isValidCategory(categoryStr);
              const subCategoryValid = categoryValid && isValidSubCategory(categoryStr, subCategoryStr);

              if (!categoryValid || !subCategoryValid) {
                  issues++;
              }

              // Fallback if invalid (but keep original string in subCat for user visibility if needed, or default)
              // We will actually import them, but maybe default the Category to LAYERS if invalid logic requires strictness.
              // For this tool, we'll auto-correct to defaults but flag it.
              const finalCategory = categoryValid ? categoryStr as ElementType : ElementType.LAYERS;
              const finalSubCategory = subCategoryValid ? subCategoryStr : 'GENERAL';

              data.push({
                  title: row['title'] || 'Untitled Import',
                  category: finalCategory,
                  subCategory: finalSubCategory,
                  description: row['description'] || 'Imported via CSV',
                  filename: row['filename'] || `imp_${Date.now()}_${i}.dwg`,
                  // Store raw status for preview UI
                  // @ts-ignore - attaching temp metadata for preview
                  _status: { 
                      catValid: categoryValid, 
                      subValid: subCategoryValid,
                      origCat: categoryStr,
                      origSub: subCategoryStr
                  }
              });
          }
          
          setParsedData(data);
          setValidationIssues(issues);

      } catch (e) {
          console.error("Parse error", e);
          alert("Failed to parse CSV. Please ensure it is a valid comma-separated file.");
      } finally {
          setIsParsing(false);
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const selectedFile = e.target.files[0];
          setFile(selectedFile);
          const reader = new FileReader();
          reader.onload = (e) => {
              const text = e.target?.result as string;
              parseCSV(text);
          };
          reader.readAsText(selectedFile);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const selectedFile = e.dataTransfer.files[0];
          setFile(selectedFile);
          const reader = new FileReader();
          reader.onload = (e) => {
              const text = e.target?.result as string;
              parseCSV(text);
          };
          reader.readAsText(selectedFile);
      }
  };

  const handleImport = async () => {
      if (parsedData.length === 0) return;
      setImporting(true);
      // Remove temp metadata before sending to service
      const cleanData = parsedData.map(item => {
          const { _status, ...rest } = item as any;
          return rest;
      });
      await onImport(cleanData);
      setImporting(false);
      onClose();
  };

  const downloadTemplate = () => {
      const csvContent = 'Title,Category,SubCategory,Description,Filename\n"Manhole, Storm, 48 inch",LAYERS,DETAIL,"Standard precast manhole, type 1",STRM-MH-48.dwg\n"Valve, Gate",BLOCKS,UTILITIES,"Gate valve symbol, dynamic",WV-GATE.dwg';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "acme_standards_template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#18181b] border border-indigo-500/50 rounded-sm shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#121212] flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest mb-1">
              Data Ingestion
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database size={20}/> Bulk Import Utility
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Left: Upload Control */}
            <div className="w-1/3 bg-[#09090b] border-r border-white/10 p-6 flex flex-col gap-6">
                
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <FileText size={14}/> CSV Specification
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                        Required Columns: Title, Category, SubCategory, Description, Filename.
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono mb-3 p-2 bg-black/40 rounded border border-white/5">
                        Supported Categories: {Object.keys(THEMES).join(', ')}
                    </div>
                    <button 
                        onClick={downloadTemplate}
                        className="w-full py-2 bg-[#18181b] hover:bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                        <Download size={12}/> Download Template
                    </button>
                </div>

                <div 
                    className={`
                        flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-6 transition-all cursor-pointer
                        ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
                    `}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileSelect} />
                    {file ? (
                        <>
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                                <Check size={24} />
                            </div>
                            <div className="text-sm font-bold text-white break-all">{file.name}</div>
                            <div className="text-xs text-neutral-500 mt-1">{(file.size / 1024).toFixed(1)} KB</div>
                            <div className="text-[10px] text-indigo-400 mt-4 uppercase font-bold tracking-wider">Change File</div>
                        </>
                    ) : (
                        <>
                            <Upload size={32} className="text-neutral-600 mb-3" />
                            <div className="text-sm font-bold text-neutral-400">Drag CSV Here</div>
                            <div className="text-xs text-neutral-600 mt-1">Supports quoted fields</div>
                        </>
                    )}
                </div>

            </div>

            {/* Right: Preview */}
            <div className="flex-1 bg-[#121212] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#18181b]">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-3">
                        <span>Preview ({parsedData.length})</span>
                        {validationIssues > 0 && (
                            <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                <AlertTriangle size={10}/> {validationIssues} Issues Found
                            </span>
                        )}
                    </div>
                    {parsedData.length > 0 && (
                        <span className="text-[10px] font-mono text-emerald-500">READY</span>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {parsedData.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-black/40 text-[10px] text-neutral-500 font-mono uppercase sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="p-3 font-medium border-b border-white/10 bg-[#121212]">Title</th>
                                    <th className="p-3 font-medium border-b border-white/10 bg-[#121212]">Category</th>
                                    <th className="p-3 font-medium border-b border-white/10 bg-[#121212]">Sub-Cat</th>
                                    <th className="p-3 font-medium border-b border-white/10 bg-[#121212]">Filename</th>
                                    <th className="p-3 font-medium border-b border-white/10 bg-[#121212] text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-neutral-300 divide-y divide-white/5">
                                {parsedData.map((row, i) => {
                                    const status = (row as any)._status;
                                    const hasError = !status?.catValid || !status?.subValid;
                                    
                                    return (
                                        <tr key={i} className={`hover:bg-white/5 ${hasError ? 'bg-red-500/5' : ''}`}>
                                            <td className="p-3 font-bold truncate max-w-[150px]" title={row.title}>{row.title}</td>
                                            <td className="p-3">
                                                <div className="flex flex-col">
                                                    <span className={`px-1.5 py-0.5 rounded border text-[9px] w-fit ${
                                                        status?.catValid 
                                                        ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' 
                                                        : 'text-red-400 border-red-500/20 bg-red-500/10'
                                                    }`}>
                                                        {row.category}
                                                    </span>
                                                    {!status?.catValid && (
                                                        <span className="text-[9px] text-red-500 mt-0.5 line-through opacity-60">{status.origCat}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 font-mono text-neutral-400">
                                                {row.subCategory}
                                                {!status?.subValid && status?.catValid && (
                                                    <span className="ml-2 text-[9px] text-amber-500">(Defaulted)</span>
                                                )}
                                            </td>
                                            <td className="p-3 font-mono text-neutral-500 truncate max-w-[120px]">{row.filename}</td>
                                            <td className="p-3 text-right">
                                                {hasError ? (
                                                    <span className="text-amber-500 text-[10px] font-bold flex items-center justify-end gap-1">
                                                        <AlertCircle size={10}/> Adjusted
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-500 text-[10px] font-bold flex items-center justify-end gap-1">
                                                        <Check size={10}/> Valid
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-600 opacity-50">
                            <Database size={48} className="mb-4"/>
                            <p>No data loaded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#18181b] border-t border-white/10 flex justify-between items-center shrink-0">
           <div className="text-xs text-neutral-500">
               {importing ? 'Processing batch insertion...' : validationIssues > 0 ? 'Invalid entries will be imported with default settings.' : 'Ready to commit data.'}
           </div>
           <div className="flex gap-3">
               <button 
                  onClick={onClose}
                  disabled={importing}
                  className="px-4 py-2 rounded border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-wider"
               >
                  Cancel
               </button>
               <button 
                  onClick={handleImport}
                  disabled={parsedData.length === 0 || importing}
                  className={`
                    px-6 py-2 rounded text-white transition-colors text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2
                    ${parsedData.length > 0 
                        ? 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer' 
                        : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}
                  `}
               >
                  {importing ? 'Importing...' : 'Run Import'} <ArrowRight size={14} />
               </button>
           </div>
        </div>

      </div>
    </div>
  );
};
