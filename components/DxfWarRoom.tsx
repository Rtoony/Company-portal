
import React, { useState, useRef, useEffect } from 'react';
import { DxfEngine, DxfData } from '../utils/dxfEngine';
import { Upload, Maximize, ZoomIn, ZoomOut, Layers, Eye, EyeOff, Move, Activity, Type as TypeIcon } from 'lucide-react';

interface DxfWarRoomProps {
  // If you want to load a file automatically, pass a URL or string here
  initialDxfContent?: string; 
}

export const DxfWarRoom: React.FC<DxfWarRoomProps> = ({ initialDxfContent }) => {
  const [data, setData] = useState<DxfData | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({});
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showText, setShowText] = useState(true);
  
  // Refs for interaction
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (initialDxfContent) processDxf(initialDxfContent);
  }, [initialDxfContent]);

  const processDxf = (content: string) => {
    setLoading(true);
    // Slight timeout to let UI show loading state
    setTimeout(() => {
        try {
            const parsed = DxfEngine.parse(content);
            
            // Initialize layers as all visible
            const layersObj: Record<string, boolean> = {};
            parsed.layers.forEach(l => layersObj[l] = true);
            
            setData(parsed);
            setActiveLayers(layersObj);
            fitToScreen(parsed);
        } catch (e) {
            console.error(e);
            alert("Failed to parse DXF");
        } finally {
            setLoading(false);
        }
    }, 100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        if (evt.target?.result) processDxf(evt.target.result as string);
    };
    reader.readAsText(file);
  };

  // --- INTERACTION LOGIC ---

  const fitToScreen = (d: DxfData) => {
      if (!containerRef.current) return;
      const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
      
      const dataRatio = d.extents.width / d.extents.height;
      const screenRatio = containerW / containerH;
      
      let scale = 1;
      if (dataRatio > screenRatio) {
          scale = containerW / d.extents.width;
      } else {
          scale = containerH / d.extents.height;
      }
      
      // Center logic
      // We want: (minX * scale) + transX = 0 (roughly)
      // Actually we center the midpoint
      const centerX = containerW / 2;
      const centerY = containerH / 2;
      
      const dataCenterX = d.extents.center.x * scale;
      // Flip Y for CAD
      const dataCenterY = -d.extents.center.y * scale; 

      setTransform({
          scale: scale * 0.9, // 90% fit
          x: centerX - dataCenterX,
          y: centerY - dataCenterY
      });
  };

  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault(); // Stop page scroll
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.max(transform.scale * (1 + delta), 0.000001); // Prevent invert
      
      // Zoom towards mouse pointer logic would go here, 
      // simplified to center zoom for prototype:
      setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      
      setTransform(prev => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy
      }));
      
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  const toggleLayer = (layerName: string) => {
      setActiveLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  // --- RENDER HELPERS ---

  // Determines color based on layer name (AutoCAD style mapping or Neon Palette)
  const getLayerColor = (layerName: string) => {
      const lower = layerName.toLowerCase();
      if (lower.includes('exist') || lower.includes('topo')) return '#71717a'; // Zinc 500 (Grey)
      if (lower.includes('prop') || lower.includes('new')) return '#06b6d4'; // Cyan 500
      if (lower.includes('strm') || lower.includes('drain')) return '#8b5cf6'; // Violet 500
      if (lower.includes('watr') || lower.includes('water')) return '#3b82f6'; // Blue 500
      if (lower.includes('sani') || lower.includes('sewer')) return '#10b981'; // Emerald 500
      if (lower.includes('text') || lower.includes('anno')) return '#fef08a'; // Yellow 200
      if (lower.includes('bldg') || lower.includes('struc')) return '#f97316'; // Orange 500
      return '#e4e4e7'; // White/Zinc 200
  };

  return (
    <div className="flex h-[600px] w-full bg-[#09090b] text-white font-sans overflow-hidden relative border border-white/10 rounded-sm">
        
        {/* --- 1. THE STAGE --- */}
        <div 
            ref={containerRef}
            className="flex-1 relative cursor-move overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 pointer-events-none z-0" 
                 style={{ 
                     backgroundImage: `
                        linear-gradient(rgba(0,255,128,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,128,0.03) 1px, transparent 1px)
                     `,
                     backgroundSize: '100px 100px',
                     backgroundPosition: `${transform.x}px ${transform.y}px`
                 }}>
            </div>
            
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)]"></div>

            {/* SVG RENDERER */}
            {data && (
                <svg className="absolute inset-0 w-full h-full z-0 overflow-visible pointer-events-none">
                    <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale}, ${-transform.scale})`}>
                        {/* Rendering Optimization: vector-effect='non-scaling-stroke' keeps lines thin regardless of zoom */}
                        {data.entities.map((ent, i) => {
                            if (!activeLayers[ent.layer]) return null;
                            const color = getLayerColor(ent.layer);
                            
                            // Line
                            if (ent.type === 'LINE') {
                                return (
                                    <line 
                                        key={i}
                                        x1={ent.points[0].x} y1={ent.points[0].y}
                                        x2={ent.points[1].x} y2={ent.points[1].y}
                                        stroke={color}
                                        strokeWidth={1}
                                        vectorEffect="non-scaling-stroke"
                                        className="drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
                                    />
                                );
                            }
                            
                            // Polyline
                            if (ent.type === 'LWPOLYLINE') {
                                const pointsStr = ent.points.map(p => `${p.x},${p.y}`).join(' ');
                                return (
                                    <polyline 
                                        key={i}
                                        points={pointsStr}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth={1}
                                        vectorEffect="non-scaling-stroke"
                                        className="drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
                                    />
                                );
                            }

                            // Circle
                            if (ent.type === 'CIRCLE' && ent.center) {
                                return (
                                    <circle 
                                        key={i}
                                        cx={ent.center.x} cy={ent.center.y}
                                        r={ent.radius}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth={1}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                )
                            }

                            // Text
                            if ((ent.type === 'TEXT' || ent.type === 'MTEXT') && ent.center && ent.text && showText) {
                                // To render text correctly in a flipped Y environment (scale(1, -1)),
                                // we must translate to the point, un-flip the specific element, and then rotate.
                                // Sequence: Translate -> Un-Scale -> Rotate
                                return (
                                    <g 
                                        key={i} 
                                        transform={`translate(${ent.center.x}, ${ent.center.y}) scale(1, -1) rotate(${-(ent.rotation || 0)})`}
                                    >
                                        <text
                                            fill={color}
                                            fontSize={ent.height || 10}
                                            fontFamily="monospace"
                                            textAnchor="start" 
                                            alignmentBaseline="baseline"
                                            style={{ userSelect: 'none', pointerEvents: 'none' }}
                                        >
                                            {ent.text}
                                        </text>
                                    </g>
                                )
                            }

                            return null;
                        })}
                    </g>
                </svg>
            )}

            {/* Empty State */}
            {!data && !loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center opacity-30">
                        <Upload size={64} className="mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold uppercase tracking-widest">No Signal</h2>
                        <p className="font-mono">Upload DXF to initialize tactical view</p>
                    </div>
                </div>
            )}
            
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-emerald-500">
                        <Activity className="animate-pulse w-12 h-12 mb-4" />
                        <span className="font-mono text-sm uppercase tracking-widest">Parsing Vector Data...</span>
                    </div>
                </div>
            )}
        </div>

        {/* --- 2. HUD (Heads Up Display) --- */}
        
        {/* Top Bar: Info */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50 pointer-events-none">
            <div className="bg-black/80 backdrop-blur border border-white/10 p-3 rounded pointer-events-auto">
                <h1 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Move size={14} className="text-emerald-500"/> Tactical Viewer
                </h1>
                {data ? (
                    <div className="mt-1 text-[10px] font-mono text-neutral-400">
                        <div>ENTITIES: {data.entities.length}</div>
                        <div>SCALE: {(transform.scale * 100).toFixed(2)}%</div>
                    </div>
                ) : (
                    <div className="mt-2">
                        <label className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold uppercase cursor-pointer transition-colors w-fit">
                            <Upload size={12} /> Load DXF
                            <input type="file" accept=".dxf" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                )}
            </div>

            {/* Controls */}
            {data && (
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <button onClick={() => fitToScreen(data)} className="p-2 bg-black/80 border border-white/10 rounded hover:bg-white/10 text-white transition-colors" title="Fit to Screen">
                        <Maximize size={16} />
                    </button>
                    <button onClick={() => setTransform(p => ({...p, scale: p.scale * 1.2}))} className="p-2 bg-black/80 border border-white/10 rounded hover:bg-white/10 text-white transition-colors">
                        <ZoomIn size={16} />
                    </button>
                    <button onClick={() => setTransform(p => ({...p, scale: p.scale * 0.8}))} className="p-2 bg-black/80 border border-white/10 rounded hover:bg-white/10 text-white transition-colors">
                        <ZoomOut size={16} />
                    </button>
                    <button onClick={() => setShowText(!showText)} className={`p-2 bg-black/80 border border-white/10 rounded hover:bg-white/10 transition-colors ${showText ? 'text-emerald-400' : 'text-neutral-500'}`} title="Toggle Text">
                        <TypeIcon size={16} />
                    </button>
                </div>
            )}
        </div>

        {/* Layer Manager (Bottom Right) */}
        {data && (
            <div className="absolute bottom-4 right-4 z-50 w-64 max-h-[50vh] flex flex-col pointer-events-auto">
                <div className="bg-black/90 backdrop-blur border border-white/10 rounded-t p-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Layers size={14} className="text-indigo-500"/> Layers ({data.layers.length})
                    </span>
                </div>
                <div className="bg-black/80 border-x border-b border-white/10 rounded-b overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {data.layers.map(layer => (
                        <button 
                            key={layer}
                            onClick={() => toggleLayer(layer)}
                            className="w-full flex items-center justify-between p-1.5 hover:bg-white/10 rounded group transition-colors"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLayerColor(layer), boxShadow: `0 0 5px ${getLayerColor(layer)}` }}></div>
                                <span className={`text-[10px] font-mono truncate ${activeLayers[layer] ? 'text-neutral-300' : 'text-neutral-600'}`}>{layer}</span>
                            </div>
                            {activeLayers[layer] ? <Eye size={12} className="text-neutral-400"/> : <EyeOff size={12} className="text-neutral-600"/>}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
