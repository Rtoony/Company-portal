
import React, { useState } from 'react';
import { StandardCard, ThemeConfig, ElementType, SvgNode, CadVector } from '../types';
import { MousePointer2, Star, FileText, Box, Layers, Terminal, Ruler, FileCode, HardDrive, Copy, Check, ExternalLink, Book, MoreVertical, ScanLine, Hash, Activity, RefreshCw, ShieldCheck, User, Database, Cpu, Loader2, ChevronRight, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { generateCategoryLore } from '../services/geminiService';

// Helper to render nested SVG nodes recursively
// Extracted outside component to avoid recreation and enable efficient memoization
const renderSvgNode = (node: SvgNode, index: number) => {
    const { tag, attrs, children, content } = node;
    const TagName = tag as React.ElementType;
    const props: any = { ...attrs, key: index };
    
    if (props.class) { props.className = props.class; delete props.class; }
    if (props['stroke-width']) { props.strokeWidth = props['stroke-width']; delete props['stroke-width']; }
    if (props['stroke-linecap']) { props.strokeLinecap = props['stroke-linecap']; delete props['stroke-linecap']; }
    if (props['stroke-linejoin']) { props.strokeLinejoin = props['stroke-linejoin']; delete props['stroke-linejoin']; }

    return (
        <TagName {...props}>
            {content}
            {children && children.map((child: SvgNode, i: number) => renderSvgNode(child, i))}
        </TagName>
    );
};

interface CadViewerProps {
    previewSvg?: CadVector;
    category: ElementType;
    textColorClass: string;
    animated: boolean;
    hoverEffect: boolean;
    size?: number; // Size override for fallback icons
}

// Memoized component for efficient SVG rendering
const CadViewer = React.memo(({ previewSvg, category, textColorClass, animated, hoverEffect, size }: CadViewerProps) => {
    // Using SVG data if available
    if (previewSvg) {
        const { viewBox, paths, elements } = previewSvg;
        
        const animateClass = animated ? 'animate-enter-draw' : '';
        const hoverClass = hoverEffect ? 'group-hover:scale-110' : '';

        return (
            <svg 
              viewBox={viewBox} 
              className={`
                w-full h-full transition-transform duration-500 ease-out
                ${animateClass}
                ${hoverClass}
                ${textColorClass}
              `}
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
                {elements && elements.map((node, i) => renderSvgNode(node, i))}
                {!elements && paths && paths.map((p, i) => (
                    <path 
                        key={i} 
                        d={p.d} 
                        stroke="currentColor" 
                        strokeWidth={p.strokeWidth || 1.5}
                        fill={p.fill || 'none'}
                        className="transition-all duration-500"
                        style={{ opacity: p.opacity || 1 }}
                    />
                ))}
            </svg>
        );
    }

    // Fallback Icon
    const iconSize = size || 48;
    const className = `${textColorClass} opacity-80`;
    const props = { size: iconSize, strokeWidth: 1.5, className };
    
    switch (category) {
      case ElementType.LAYERS: return <Layers {...props} />;
      case ElementType.MACROS: return <Terminal {...props} />;
      case ElementType.SYMBOLS: return <Box {...props} />;
      case ElementType.BLOCKS: return <Box {...props} />;
      case ElementType.DETAILS: return <Ruler {...props} />;
      case ElementType.SPECIFICATIONS: return <Book {...props} />;
      default: return <FileText {...props} />;
    }
});

interface TradingCardProps {
  card: StandardCard;
  description?: string;
  theme: ThemeConfig;
  variant?: 'gallery' | 'zoomed' | 'list';
  onZoom?: () => void;
  onClose?: () => void;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (card: StandardCard) => void;
  onDelete?: (id: string) => void;
}

export const TradingCard: React.FC<TradingCardProps> = ({ 
    card, 
    description, 
    theme, 
    variant = 'gallery', 
    onZoom, 
    onClose, 
    onToggleFavorite,
    onEdit,
    onDelete
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lore, setLore] = useState<string | null>(null);
  const [loadingLore, setLoadingLore] = useState(false);
  
  // Determine layout mode based on category
  const isVisualCategory = [ElementType.SYMBOLS, ElementType.BLOCKS, ElementType.DETAILS].includes(card.category);

  // Determine which description to show: prop override > card data
  const displayDescription = description || card.description;

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (variant === 'zoomed' && onClose) onClose();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((variant === 'gallery' || variant === 'list') && onZoom) {
      onZoom();
    } else if (variant === 'zoomed') {
      // Only flip if not clicking specific interactive elements (handled by stopPropagation in children)
      handleFlip();
    }
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(card.id);
  }

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.fullPath) {
        navigator.clipboard.writeText(card.fullPath);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFetchLore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lore) return; // Already fetched
    
    setLoadingLore(true);
    try {
        const text = await generateCategoryLore(card.category);
        setLore(text);
    } catch (error) {
        setLore("Error retrieving archive data.");
    } finally {
        setLoadingLore(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(onEdit) onEdit(card);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Simple confirm here, ideally a custom modal in App.tsx
      if (onDelete && window.confirm("Are you sure you want to PURGE this record from the database?")) {
          onDelete(card.id);
      }
  };

  const borderColorClass = theme.baseColor.replace('bg-', 'border-');
  const textColorClass = theme.baseColor.replace('bg-', 'text-');
  const hoverBorderClass = theme.baseColor.replace('bg-', 'hover:border-');

  // ============================================================================
  // LIST VARIANT (COMPACT ROW)
  // ============================================================================
  if (variant === 'list') {
    return (
        <div 
            onClick={handleClick}
            className={`
                group flex items-center gap-4 p-3 bg-[var(--bg-card)] border-b border-white/5 
                hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden
            `}
        >
            {/* Hover Status Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.baseColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            {/* Icon Column */}
            <div className="w-10 h-10 shrink-0 bg-black/20 rounded border border-white/5 flex items-center justify-center">
                <div className="w-6 h-6">
                    <CadViewer 
                        previewSvg={card.previewSvg}
                        category={card.category}
                        textColorClass={textColorClass}
                        animated={false}
                        hoverEffect={false}
                        size={24}
                    />
                </div>
            </div>

            {/* ID Column */}
            <div className="w-24 shrink-0">
                <div className="text-[10px] font-bold font-mono text-neutral-500">{card.id}</div>
            </div>

            {/* Title & Desc Column */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold text-[var(--text-main)] group-hover:${textColorClass} truncate`}>
                        {card.title}
                    </h4>
                    {card.isNew && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                </div>
                <p className="text-xs text-neutral-500 truncate pr-4">{displayDescription}</p>
            </div>

            {/* SubCategory Badge */}
            <div className="w-32 hidden md:flex shrink-0">
                 <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-white/5 rounded bg-white/5 text-neutral-400`}>
                    {card.subCategory}
                 </span>
            </div>

            {/* Stats / Filename */}
            <div className="w-40 hidden lg:block shrink-0 text-right pr-4">
                 <div className="text-[10px] font-mono text-neutral-500 truncate">{card.filename}</div>
                 <div className="text-[9px] text-neutral-600">Usage: {card.stats.usage}%</div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-white/10">
                 <button 
                    onClick={handleStarClick}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                 >
                    <Star size={14} className={card.isFavorite ? "fill-amber-400 text-amber-400" : "text-neutral-600 hover:text-white"} />
                 </button>
                 <div className="flex gap-1">
                    <button onClick={handleEditClick} className="p-2 text-neutral-600 hover:text-[var(--navy)] transition-colors" title="Edit">
                        <Edit size={14} />
                    </button>
                    <button onClick={handleDeleteClick} className="p-2 text-neutral-600 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={14} />
                    </button>
                 </div>
            </div>
        </div>
    );
  }

  // ============================================================================
  // GALLERY VARIANT (CARD)
  // ============================================================================
  if (variant === 'gallery') {
    return (
      <div 
        onClick={handleClick}
        className={`
          group relative w-full aspect-[4/3] 
          bg-[var(--bg-card)] rounded-sm overflow-hidden
          border border-[var(--border-main)]
          transition-all duration-300 cursor-pointer
          flex flex-col shadow-md
          hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
          ${hoverBorderClass}
        `}
      >
         {/* Top Accent Bar (Thick) */}
         <div className={`w-full h-1.5 ${theme.baseColor}`}></div>

         {/* Header Row */}
         <div className="px-3 pt-3 flex justify-between items-start">
             <div className="flex-1 pr-2">
                <h3 className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--text-highlight)] tracking-wide leading-tight truncate">
                   {card.title}
                </h3>
             </div>
             <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${textColorClass}`}>
                    {card.subCategory}
                </span>
                <button 
                    onClick={handleStarClick} 
                    className="hover:scale-110 transition-transform"
                >
                   <Star size={12} className={card.isFavorite ? "fill-amber-400 text-amber-400" : "text-neutral-600 hover:text-neutral-400"} />
                </button>
             </div>
         </div>

         {/* Main Content Body (Divergent based on Type) */}
         <div className="flex-1 relative px-3 py-2 flex items-center justify-center overflow-hidden">
             
             {isVisualCategory ? (
                 // --- VISUAL STYLE: Large Animated SVG ---
                 <div className="w-full h-full flex items-center justify-center p-2 relative">
                    {/* Background Grid for Visuals */}
                    <div className="absolute inset-2 border border-[var(--border-subtle)] bg-white/[0.02] rounded-sm"></div>
                    <div className="relative w-full h-full z-10">
                        <CadViewer 
                            previewSvg={card.previewSvg}
                            category={card.category}
                            textColorClass={textColorClass}
                            animated={false}
                            hoverEffect={true}
                            size={48}
                        />
                    </div>
                 </div>
             ) : (
                 // --- DATA STYLE: Text + Small Static Icon ---
                 <div className="w-full h-full relative flex flex-col">
                     {/* Description Text */}
                     <div className="relative z-10 flex-1 overflow-hidden group-hover:overflow-y-auto custom-scrollbar pr-8 pt-1">
                        <p className={`
                            text-xs leading-relaxed font-medium text-neutral-500 dark:text-neutral-400 
                            group-hover:${textColorClass} group-hover:text-left group-hover:line-clamp-none line-clamp-4
                            transition-colors
                        `}>
                           {displayDescription}
                        </p>
                     </div>

                     {/* Static Icon - Positioned Top Right, Small & Static */}
                     <div className="absolute top-0 right-0 w-8 h-8 opacity-60 pointer-events-none">
                        <CadViewer 
                            previewSvg={card.previewSvg}
                            category={card.category}
                            textColorClass={textColorClass}
                            animated={false}
                            hoverEffect={false}
                            size={32}
                        />
                     </div>
                 </div>
             )}

         </div>

         {/* Footer Row */}
         <div className="px-3 pb-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[9px] font-mono text-neutral-500">
             <div className="flex items-center gap-1 truncate max-w-[60%]">
                <FileCode size={10} />
                <span className="truncate uppercase">{card.filename || 'NO_FILE'}</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="opacity-50">ID:</span>
                <span className="text-neutral-400">{card.id}</span>
             </div>
         </div>
      </div>
    );
  }

  // ============================================================================
  // ZOOMED VARIANT (DARK INDUSTRIAL THEME)
  // ============================================================================
  return (
    <div 
      className="relative w-[360px] h-[540px] md:w-[550px] md:h-[750px] perspective-1000 cursor-pointer selection:bg-transparent"
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
       <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* ================= FRONT FACE ================= */}
          <div className="absolute inset-0 backface-hidden bg-[var(--bg-card)] border border-[var(--border-main)] rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
             
             {/* Status Bar */}
             <div className="h-1.5 w-full flex">
                <div className={`flex-1 ${theme.baseColor} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
                <div className="w-16 bg-neutral-800 border-l border-white/5"></div>
             </div>

             {/* Header Section */}
             <div className="px-8 pt-8 pb-6 flex justify-between items-start bg-white/[0.02] border-b border-[var(--border-subtle)] relative">
                {/* Decorative Corner Mark */}
                <div className={`absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-${theme.baseColor.split('-')[1]}-500/20 border-l-transparent`}></div>

                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-white/10 text-neutral-300 rounded border border-white/5 tracking-wider">
                       ID.{card.id}
                     </span>
                     <div className="h-px w-8 bg-white/10"></div>
                     <span className={`text-[10px] font-bold font-mono uppercase tracking-widest ${textColorClass}`}>
                        {card.category} // {card.subCategory}
                     </span>
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight leading-none mb-2">{card.title}</h2>
                  
                  {/* Data Card Description (Front Face) */}
                  {!isVisualCategory && displayDescription && (
                     <div className="mt-4 relative pl-4">
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${theme.baseColor} opacity-50`}></div>
                        <p className="text-sm text-neutral-400 font-medium leading-relaxed">
                            {displayDescription}
                        </p>
                     </div>
                  )}
                </div>
                
                {/* Header Actions */}
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={handleStarClick} 
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all group shadow-lg"
                    >
                        <Star size={24} className={card.isFavorite ? "fill-amber-400 text-amber-400" : "text-neutral-600 group-hover:text-white"} />
                    </button>
                    <button onClick={handleEditClick} className="p-3 bg-white/5 hover:bg-[rgba(0,49,83,0.2)] hover:border-[var(--navy)]/50 border border-white/5 rounded-full transition-all group text-neutral-500 hover:text-[var(--navy)]">
                        <Edit size={20} />
                    </button>
                    <button onClick={handleDeleteClick} className="p-3 bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 border border-white/5 rounded-full transition-all group text-neutral-500 hover:text-red-400">
                        <Trash2 size={20} />
                    </button>
                </div>
             </div>

             {/* Main Content Area (Grid Background) */}
             <div className="flex-1 p-8 relative flex flex-col">
                {/* Dark Dot Grid Background */}
                <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none"></div>
                
                {isVisualCategory ? (
                    // --- VISUAL ZOOMED LAYOUT ---
                    <div className="flex-1 flex items-center justify-center relative z-10">
                        {/* Glowing Portal Container */}
                        <div className={`
                            relative w-56 h-56 md:w-72 md:h-72 rounded-full 
                            flex items-center justify-center group-hover:scale-105 transition-transform duration-500
                            ${textColorClass}
                        `}>
                            {/* Outer Glow Ring */}
                            <div className={`absolute inset-0 rounded-full border-2 ${borderColorClass} opacity-20 shadow-[0_0_30px_rgba(0,0,0,0.3)]`}></div>
                            {/* Rotating Ring */}
                            <div className={`absolute inset-4 rounded-full border border-dashed ${borderColorClass} opacity-20 animate-[spin_10s_linear_infinite]`}></div>
                            
                            {/* The SVG Itself */}
                            <div className="w-36 h-36 md:w-52 md:h-52 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                <CadViewer 
                                    previewSvg={card.previewSvg}
                                    category={card.category}
                                    textColorClass={textColorClass}
                                    animated={true}
                                    hoverEffect={false}
                                    size={72}
                                />
                            </div>
                        </div>
                        
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                             <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 rounded border border-white/10 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                <ScanLine size={12} /> Interactive Geometry
                             </div>
                        </div>
                    </div>
                ) : (
                    // --- DATA ZOOMED LAYOUT ---
                    <div className="flex-1 flex flex-col relative z-10">
                        {/* Static Icon Header */}
                        <div className="flex items-center gap-6 mb-8">
                             <div className={`w-24 h-24 p-5 rounded-xl border border-white/10 bg-black/20 shadow-inner flex items-center justify-center ${textColorClass}`}>
                                <CadViewer 
                                    previewSvg={card.previewSvg}
                                    category={card.category}
                                    textColorClass={textColorClass}
                                    animated={false}
                                    hoverEffect={false}
                                    size={72}
                                />
                             </div>
                             <div className="space-y-2">
                                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">System UUID</div>
                                <div className="font-mono text-xl text-white tracking-widest">{card.id}</div>
                                <div className="h-1 w-16 bg-white/10 rounded-full"></div>
                             </div>
                        </div>

                        {/* Quick Attributes Grid - Dark Theme */}
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                             <div className="p-4 bg-white/5 border border-white/5 rounded hover:border-white/10 transition-colors">
                                 <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                    <RefreshCw size={12}/> Revision
                                 </div>
                                 <div className="font-mono text-sm font-bold text-white">v2.0.4</div>
                             </div>
                             <div className="p-4 bg-white/5 border border-white/5 rounded hover:border-white/10 transition-colors">
                                 <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                    <User size={12}/> Author
                                 </div>
                                 <div className="font-mono text-sm font-bold text-white">Admin</div>
                             </div>
                             <div className="p-4 bg-white/5 border border-white/5 rounded hover:border-white/10 transition-colors">
                                 <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                    <Ruler size={12}/> Scale
                                 </div>
                                 <div className="font-mono text-sm font-bold text-white">1:1 (NTS)</div>
                             </div>
                             <div className="p-4 bg-white/5 border border-white/5 rounded hover:border-white/10 transition-colors">
                                 <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                    <Activity size={12}/> Usage
                                 </div>
                                 <div className={`font-mono text-sm font-bold ${parseInt(card.stats.usage.toString()) > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {card.stats.usage}/100
                                 </div>
                             </div>
                        </div>
                        
                        <div className="mt-6 text-center opacity-40">
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.3em]">Standard Configuration</span>
                        </div>
                    </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="h-16 bg-[var(--bg-main)] border-t border-[var(--border-subtle)] flex items-center text-xs font-bold text-neutral-400">
                <div className="flex-1 h-full flex items-center justify-center gap-2 border-r border-[var(--border-subtle)]">
                   <ShieldCheck size={14} className="text-emerald-500"/>
                   <span className="tracking-wider">VERIFIED</span>
                </div>
                <div className="flex-1 h-full flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-colors group text-neutral-300">
                   <span className="tracking-wider">INSPECT SPEC</span>
                   <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity"/>
                </div>
             </div>
          </div>


          {/* ================= BACK FACE (Specification) ================= */}
          <div className={`
             absolute inset-0 backface-hidden rotate-y-180 
             bg-[var(--bg-card)] border border-[var(--border-main)] rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8)]
             flex flex-col overflow-hidden text-neutral-300
          `}>
             {/* Top Bar */}
             <div className={`h-1.5 w-full ${theme.baseColor} opacity-50`}></div>

             {/* Header */}
             <div className="h-20 bg-[var(--bg-main)] border-b border-white/5 flex items-center px-8 justify-between">
                <div>
                    <h2 className={`text-lg font-bold tracking-widest uppercase font-mono flex items-center gap-2 ${textColorClass}`}>
                    <FileText size={18} /> Specification
                    </h2>
                    <p className="text-[10px] text-neutral-600 font-mono mt-1">INTERNAL REFERENCE DATA</p>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded border border-white/5 text-xs font-mono text-neutral-400">
                    REF-{card.id}
                </div>
             </div>

             {/* Scrollable Terminal Content */}
             <div className="flex-1 p-8 font-mono text-sm overflow-y-auto custom-scrollbar bg-[var(--bg-main)] relative">
                 {/* Subtle Grid in Background */}
                 <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                 
                 <div className="relative z-10 space-y-8">
                    
                    {/* Section 1: Description */}
                    <div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${textColorClass} opacity-80`}>
                            <Hash size={12}/> Description
                        </h3>
                        <p className="leading-7 text-neutral-400 border-l-2 border-white/10 pl-4 text-xs">
                            {displayDescription}
                        </p>
                    </div>

                    {/* NEW: Usage Protocol */}
                    <div className="p-4 bg-white/5 rounded border border-white/5 relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.baseColor}`}></div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${textColorClass}`}>
                            <AlertTriangle size={12}/> Usage Protocol
                        </h3>
                        <p className="text-xs text-neutral-300 leading-relaxed italic">
                            "{card.usageProtocol || 'Standard drafting protocols apply. Verify local jurisdiction requirements before deployment.'}"
                        </p>
                    </div>

                    {/* Section 2: Source Data */}
                    <div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${textColorClass} opacity-80`}>
                            <HardDrive size={12}/> Source Data
                        </h3>
                        
                        <div className="space-y-3">
                            {/* Filename */}
                            <div className="group">
                                <label className="block text-[9px] text-neutral-600 mb-1 uppercase tracking-wider">Filename</label>
                                <div className="flex items-center gap-3 text-neutral-300 bg-white/5 p-3 rounded border border-white/5 hover:border-white/20 transition-colors">
                                    <FileCode size={14} className="opacity-50 shrink-0"/>
                                    <span className="truncate select-all">{card.filename || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Full Path */}
                            <div className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <label className="block text-[9px] text-neutral-600 uppercase tracking-wider">Network Path</label>
                                    {copied && <span className="text-[9px] text-emerald-500 font-bold animate-pulse">COPIED</span>}
                                </div>
                                <div 
                                    onClick={handleCopyPath}
                                    className="relative flex items-start gap-3 text-neutral-400 bg-white/5 p-3 rounded border border-white/5 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all cursor-pointer"
                                >
                                    <Terminal size={14} className="mt-1 shrink-0 opacity-50"/>
                                    <span className="break-all text-xs leading-relaxed">{card.fullPath}</span>
                                    <div className="absolute top-2 right-2 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Copy size={10} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: System Properties (Data Cards Only) */}
                    {!isVisualCategory && (
                        <div>
                            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${textColorClass} opacity-80`}>
                                <Layers size={12}/> Layer Attributes
                            </h3>
                            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 rounded overflow-hidden">
                                <div className="p-3 bg-[var(--bg-main)]">
                                    <div className="text-[9px] text-neutral-600 uppercase">Layer Key</div>
                                    <div className="text-xs text-neutral-300 mt-1">C-PROP-LINE</div>
                                </div>
                                <div className="p-3 bg-[var(--bg-main)]">
                                    <div className="text-[9px] text-neutral-600 uppercase">Color</div>
                                    <div className="text-xs text-neutral-300 mt-1">INDEX 4 (CYAN)</div>
                                </div>
                                <div className="p-3 bg-[var(--bg-main)]">
                                    <div className="text-[9px] text-neutral-600 uppercase">Linetype</div>
                                    <div className="text-xs text-neutral-300 mt-1">PHANTOM2</div>
                                </div>
                                <div className="p-3 bg-[var(--bg-main)]">
                                    <div className="text-[9px] text-neutral-600 uppercase">Plot Style</div>
                                    <div className="text-xs text-neutral-300 mt-1">NORMAL</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Section 4: Mainframe Archives (AI Lore) */}
                    <div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${textColorClass} opacity-80`}>
                            <Cpu size={12}/> Mainframe Archives
                        </h3>
                        
                        {!lore ? (
                            <button 
                                onClick={handleFetchLore}
                                disabled={loadingLore}
                                className={`
                                    w-full p-4 border border-dashed border-white/20 rounded bg-white/5 
                                    hover:bg-white/10 hover:border-${theme.baseColor.split('-')[1]}-500/50 
                                    transition-all flex items-center justify-center gap-3 text-neutral-400 hover:text-white
                                    group
                                `}
                            >
                                {loadingLore ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin text-neutral-500" />
                                        <span className="text-[10px] font-mono animate-pulse">DECRYPTING ARCHIVES...</span>
                                    </>
                                ) : (
                                    <>
                                        <Database size={16} className={`group-hover:${textColorClass}`} />
                                        <span className="text-[10px] font-mono uppercase tracking-widest">Retrieve Historical Log</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="p-4 bg-black/40 border border-white/10 rounded relative overflow-hidden animate-in fade-in duration-500">
                                <div className={`absolute top-0 left-0 w-1 h-full ${theme.baseColor}`}></div>
                                <p className="text-[10px] leading-relaxed text-neutral-400 font-mono">
                                    <span className={`${textColorClass} font-bold mr-2`}>root@sys:~$</span>
                                    {lore}
                                </p>
                            </div>
                        )}
                    </div>

                 </div>
             </div>

             {/* Action Footer */}
             <div className="p-6 bg-[var(--bg-main)] border-t border-white/10">
                <button className={`
                    w-full py-3 font-bold text-black text-sm uppercase tracking-widest rounded shadow-lg 
                    ${theme.baseColor} hover:brightness-110 active:scale-[0.98] transition-all 
                    flex items-center justify-center gap-2
                `}>
                  Load Into Project <ExternalLink size={16}/>
                </button>
             </div>
          </div>

       </div>
       
       <style>{`
           @keyframes dash {
              from { stroke-dasharray: 100; stroke-dashoffset: 100; }
              to { stroke-dasharray: 100; stroke-dashoffset: 0; }
           }
           .animate-enter-draw path {
              stroke-dasharray: 100;
              stroke-dashoffset: 100;
              animation: dash 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
           }
           /* Stagger animations */
           .animate-enter-draw path:nth-child(1) { animation-delay: 0.1s; }
           .animate-enter-draw path:nth-child(2) { animation-delay: 0.3s; }
           .animate-enter-draw path:nth-child(3) { animation-delay: 0.5s; }
       `}</style>
    </div>
  );
};
