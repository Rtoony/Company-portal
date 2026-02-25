import { ElementType, ThemeConfig, NavButton, CadVector } from './types';

export const THEMES: Record<ElementType, ThemeConfig> = {
  [ElementType.DETAILS]: {
    id: ElementType.DETAILS,
    label: 'DETAILS',
    baseColor: 'bg-purple-500',
    accentColor: 'bg-purple-400',
    textColor: 'text-purple-950',
    pattern: 'linear-gradient(0deg, transparent 24%, rgba(168, 85, 247, .4) 25%, rgba(168, 85, 247, .4) 26%, transparent 27%, transparent 74%, rgba(168, 85, 247, .4) 75%, rgba(168, 85, 247, .4) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(168, 85, 247, .4) 25%, rgba(168, 85, 247, .4) 26%, transparent 27%, transparent 74%, rgba(168, 85, 247, .4) 75%, rgba(168, 85, 247, .4) 76%, transparent 77%, transparent)', 
    iconName: 'Ruler'
  },
  [ElementType.BLOCKS]: {
    id: ElementType.BLOCKS,
    label: 'BLOCKS',
    baseColor: 'bg-orange-500',
    accentColor: 'bg-orange-400',
    textColor: 'text-orange-950',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.8) 0%, transparent 50%)', // Orange 400
    iconName: 'Cuboid'
  },
  [ElementType.SYMBOLS]: {
    id: ElementType.SYMBOLS,
    label: 'SYMBOLS',
    baseColor: 'bg-cyan-500',
    accentColor: 'bg-cyan-400',
    textColor: 'text-cyan-950',
    pattern: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(6, 182, 212, 0.4) 20px)', 
    iconName: 'TriangleAlert'
  },
  [ElementType.LAYERS]: {
    id: ElementType.LAYERS,
    label: 'LAYERS',
    baseColor: 'bg-red-500',
    accentColor: 'bg-red-400',
    textColor: 'text-red-950',
    pattern: 'radial-gradient(circle, #ef4444 1.5px, transparent 2px)', // Red 500 dots
    iconName: 'Layers'
  },
  [ElementType.SPECIFICATIONS]: {
    id: ElementType.SPECIFICATIONS,
    label: 'SPECS',
    baseColor: 'bg-pink-500',
    accentColor: 'bg-pink-400',
    textColor: 'text-pink-950',
    pattern: 'repeating-linear-gradient(45deg, #ec4899, #ec4899 10px, #f472b6 10px, #f472b6 20px)', 
    iconName: 'Book'
  },
  [ElementType.MACROS]: {
    id: ElementType.MACROS,
    label: 'MACROS',
    baseColor: 'bg-emerald-500',
    accentColor: 'bg-emerald-400',
    textColor: 'text-emerald-950',
    pattern: 'linear-gradient(135deg, #10b981 25%, transparent 25%) -10px 0, linear-gradient(225deg, #10b981 25%, transparent 25%) -10px 0', // Emerald 500
    iconName: 'Terminal'
  }
};

export const SUB_CATEGORIES: Record<ElementType, string[]> = {
  [ElementType.LAYERS]: ['ALL', 'GENERAL', 'EXISTING', 'PROPOSED', 'DETAIL'],
  [ElementType.MACROS]: ['ALL', 'GENERAL', 'DYNAMIC', 'TOOLS'],
  [ElementType.SYMBOLS]: ['ALL', 'GENERAL', 'ANNOTATION', 'ARROWS', 'STAMPS', 'LEGENDS'],
  [ElementType.BLOCKS]: ['ALL', 'GENERAL', 'LANDSCAPE', 'TRANSPORT', 'UTILITIES', 'STRUCTURES'],
  [ElementType.DETAILS]: ['ALL', 'GENERAL', 'STORM', 'SEWER', 'WATER', 'ROADWAY'],
  [ElementType.SPECIFICATIONS]: ['ALL', 'GENERAL', 'SITEWORK', 'CONCRETE', 'UTILITIES']
};

export const SIDEBAR_BUTTONS: NavButton[] = [
  { id: 'new', label: 'WHATS NEW', action: 'NEW' },
  { id: 'frequent', label: 'FREQUENTLY USE', action: 'FREQUENT' },
];

// Helper to generate vector data based on category/subcategory
// In a real production app, this might live in a View Helper or be stored as JSON in the DB
export const generateVectorData = (category: ElementType, subCategory: string, id: string, title: string): CadVector => {
  const titleLower = title.toLowerCase();

  // --- LAYERS ---
  if (category === ElementType.LAYERS) {
     if (subCategory === 'EXISTING') {
         // Dashed / Faded planes
         return {
             viewBox: "0 0 100 100",
             paths: [
                 { d: "M15,40 L55,40 L75,60 L35,60 Z", strokeWidth: 1.5, opacity: 0.5, fill: "none" },
                 { d: "M15,60 L55,60 L75,80 L35,80 Z", strokeWidth: 1.5, opacity: 0.5, fill: "none" },
                 { d: "M15,80 L55,80 L75,100 L35,100 Z", strokeWidth: 1.5, opacity: 0.5, fill: "none" }
             ]
         }
     }
     if (subCategory === 'PROPOSED') {
         // Solid Bold Planes
         return {
             viewBox: "0 0 100 100",
             paths: [
                 { d: "M15,40 L55,40 L75,60 L35,60 Z", strokeWidth: 3, fill: "currentColor", opacity: 0.2 },
                 { d: "M15,60 L55,60 L75,80 L35,80 Z", strokeWidth: 3, fill: "none" },
                 { d: "M15,80 L55,80 L75,100 L35,100 Z", strokeWidth: 3, fill: "none" }
             ]
         }
     }
     // Default Layers
     return {
         viewBox: "0 0 100 100",
         paths: [
             { d: "M15,40 L55,40 L75,60 L35,60 Z", strokeWidth: 2 }, 
             { d: "M15,60 L55,60 L75,80 L35,80 Z", strokeWidth: 2, opacity: 0.7 }, 
             { d: "M15,80 L55,80 L75,100 L35,100 Z", strokeWidth: 2, opacity: 0.4 }, 
             { d: "M75,60 L75,80 M35,60 L35,80", strokeWidth: 1, opacity: 0.3 } 
         ]
     }
  }

  // --- SPECIFICATIONS ---
  if (category === ElementType.SPECIFICATIONS) {
      if (subCategory === 'SITEWORK') {
          // Earth / Terrain icon on Doc
          return {
              viewBox: "0 0 100 100",
              paths: [
                { d: "M25,10 L75,10 L75,90 L25,90 Z", strokeWidth: 2 }, 
                { d: "M25,70 Q35,60 50,75 Q65,90 75,80", strokeWidth: 2, fill: "none" }, // Terrain curve
                { d: "M35,25 L65,25", strokeWidth: 2 }, // Header
                { d: "M35,35 L65,35 M35,45 L65,45", strokeWidth: 1, opacity: 0.5 }
              ]
          }
      }
      if (subCategory === 'CONCRETE') {
           // Concrete Hatch on Doc
           return {
               viewBox: "0 0 100 100",
               paths: [
                 { d: "M25,10 L75,10 L75,90 L25,90 Z", strokeWidth: 2 },
                 { d: "M35,60 L40,65 L30,65 Z M55,75 L60,80 L50,80 Z", fill: "currentColor" }, // Triangles
                 { d: "M35,25 L65,25", strokeWidth: 2 }
               ]
           }
      }
      // Default Spec
      return {
          viewBox: "0 0 100 100",
          paths: [
            { d: "M25,10 L75,10 L75,90 L25,90 Z", strokeWidth: 2 },
            { d: "M35,25 L65,25", strokeWidth: 2 },
            { d: "M35,35 L65,35 M35,45 L65,45 M35,55 L65,55 M35,65 L55,65", strokeWidth: 1, opacity: 0.5 },
            { d: "M60,75 L70,85 L70,75 Z", fill: "currentColor", opacity: 0.3 }
          ]
      }
  }

  // --- MACROS ---
  if (category === ElementType.MACROS) {
      if (subCategory === 'TOOLS') {
          // Wrench/Tool icon
          return {
              viewBox: "0 0 100 100",
              paths: [
                  { d: "M30,30 L70,70", strokeWidth: 4 },
                  { d: "M25,25 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0", strokeWidth: 2 },
                  { d: "M75,75 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0", strokeWidth: 2 }
              ]
          }
      }
  }

  // --- TREES & VEGETATION ---
  if (titleLower.includes('tree') || (subCategory === 'LANDSCAPE' && (titleLower.includes('save') || titleLower.includes('remove')))) {
      const isRemove = titleLower.includes('remove');
      return {
          viewBox: "0 0 100 100",
          paths: [
              // Organic canopy shape (approximate with polygon)
              { d: "M50,10 Q65,10 75,20 Q90,25 90,50 Q90,75 75,85 Q60,95 50,90 Q35,95 25,85 Q10,75 10,50 Q10,25 25,20 Q35,10 50,10 Z", strokeWidth: 2, fill: isRemove ? 'none' : 'currentColor', opacity: isRemove ? 1 : 0.1 }, 
              // Trunk
              { d: "M50,50 L50,50", strokeWidth: 6 },
              // Branches
              { d: "M50,50 L25,25 M50,50 L75,25 M50,50 L75,75 M50,50 L25,75", strokeWidth: 1.5 },
              // X for Remove
              ...(isRemove ? [{ d: "M20,20 L80,80 M80,20 L20,80", strokeWidth: 3, opacity: 0.8 }] : [])
          ]
      };
  }

  // --- VEHICLES ---
  if (titleLower.includes('vehicle') || titleLower.includes('truck')) {
      if (titleLower.includes('fire')) {
        // Fire Truck (Longer, ladders)
        return {
            viewBox: "0 0 100 100",
            paths: [
                { d: "M25,10 L75,10 L75,90 L25,90 Z", strokeWidth: 2 }, // Body
                { d: "M25,25 L75,25", strokeWidth: 1 }, // Cab sep
                { d: "M30,30 L40,80 M60,30 L70,80", strokeWidth: 1 }, // Ladders
                { d: "M30,35 L70,35 M30,45 L70,45 M30,55 L70,55 M30,65 L70,65", strokeWidth: 1, opacity: 0.5 }, // Rungs
                { d: "M20,20 L25,20 M75,20 L80,20 M20,80 L25,80 M75,80 L80,80", strokeWidth: 3 } // Mirrors/Lights
            ]
        }
      }
      // Standard Car
      return {
          viewBox: "0 0 100 100",
          paths: [
              { d: "M30,15 L70,15 L75,30 L75,80 L70,90 L30,90 L25,80 L25,30 Z", strokeWidth: 2 }, // Body
              { d: "M30,35 L70,35 L70,60 L30,60 Z", opacity: 0.5 }, // Roof/Glass
              { d: "M20,25 L30,25 M70,25 L80,25 M20,75 L30,75 M70,75 L80,75", strokeWidth: 3 } // Wheels
          ]
      }
  }

  // --- HYDRANT ---
  if (titleLower.includes('hydrant') || titleLower.includes('fh')) {
      return {
          viewBox: "0 0 100 100",
          paths: [
              { d: "M50,50 m-20,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0", strokeWidth: 2 }, // Main Body
              { d: "M30,50 L10,50 M70,50 L90,50 M50,30 L50,10", strokeWidth: 3 }, // Nozzles
              { d: "M5,45 L15,45 L15,55 L5,55 Z M85,45 L95,45 L95,55 L85,55 Z", strokeWidth: 1 }, // Caps
              { d: "M50,50 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0", opacity: 0.5 } // Center bolt
          ]
      }
  }

  // --- PIPING / FLANGES ---
  if (titleLower.includes('flg') || titleLower.includes('flange')) {
     if (titleLower.includes('tee')) {
         // Tee
         return {
             viewBox: "0 0 100 100",
             paths: [
                 { d: "M10,35 L90,35 L90,65 L65,65 L65,90 L35,90 L35,65 L10,65 Z", strokeWidth: 2 }, // Tee Body
                 { d: "M10,35 L15,65 M90,35 L85,65 M35,90 L65,90", strokeWidth: 1, opacity: 0.5 }, // Flange lines
                 { d: "M50,35 L50,65 M35,50 L65,50", opacity: 0.3 } // Centerlines
             ]
         }
     }
     // Standard Flange
     return {
         viewBox: "0 0 100 100",
         paths: [
             { d: "M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0", strokeWidth: 2 }, // Outer
             { d: "M50,50 m-20,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0", strokeWidth: 2 }, // Inner Pipe
             // Bolts (simplified)
             { d: "M50,15 L50,20 M50,80 L50,85 M15,50 L20,50 M80,50 L85,50 M25,25 L30,30 M70,70 L75,75 M25,75 L30,70 M70,25 L75,30", strokeWidth: 3 }
         ]
     }
  }

  // --- ARROWS ---
  if (category === ElementType.SYMBOLS || category === ElementType.MACROS) {
      if (titleLower.includes('north')) {
          return {
              viewBox: "0 0 100 100",
              paths: [
                  { d: "M50,10 L65,50 L50,90 L35,50 Z", strokeWidth: 2 }, // Main Diamond
                  { d: "M50,10 L50,90", strokeWidth: 1 }, // Vertical Split
                  { d: "M50,10 L65,50 L50,50 Z", fill: "currentColor" }, // Fill half
                  { d: "M40,40 L60,40 M50,30 L50,40", strokeWidth: 1, opacity: 0.5 } // N text hint
              ]
          }
      }
      if (titleLower.includes('arrow')) {
          return {
              viewBox: "0 0 100 100",
              paths: [
                  { d: "M10,50 L80,50", strokeWidth: 2 }, // Shaft
                  { d: "M60,30 L90,50 L60,70", strokeWidth: 2 }, // Head
                  { d: "M60,30 L60,70", strokeWidth: 1, opacity: 0.5 } // Closed head option
              ]
          }
      }
  }

  // --- DETAILS / SECTIONS ---
  if (category === ElementType.DETAILS) {
      if (titleLower.includes('wall')) {
          return {
              viewBox: "0 0 100 100",
              paths: [
                  { d: "M10,80 L90,80", strokeWidth: 2 }, // Grade
                  { d: "M30,80 L30,20 L60,20 L60,80", strokeWidth: 2 }, // Wall outline
                  { d: "M30,80 L40,90 L50,90 L60,80", strokeWidth: 1, opacity: 0.6 }, // Footing hint
                  // Concrete Hatch (Triangles)
                  { d: "M35,30 L37,34 L33,34 Z M50,50 L52,54 L48,54 Z M40,70 L42,74 L38,74 Z", opacity: 0.5, fill: "currentColor" }
              ]
          }
      }
      // Generic Section
      return {
          viewBox: "0 0 100 100",
          paths: [
              { d: "M10,80 L90,80", strokeWidth: 3 }, // Heavy Ground Line
              { d: "M20,80 L20,20 L80,20 L80,80", strokeWidth: 1.5 }, // Box
              { d: "M20,20 L80,80 M80,20 L20,80", opacity: 0.2 } // X
          ]
      }
  }
  
  // Fallback: Generic Cube with Dimension Lines
  return {
      viewBox: "0 0 100 100",
      paths: [
          { d: "M25,35 L75,35 L75,85 L25,85 Z", strokeWidth: 2 }, // Box
          { d: "M25,35 L75,85 M75,35 L25,85", opacity: 0.2 }, // Center
          { d: "M20,35 L20,85", strokeWidth: 1 }, // Dim Line Left
          { d: "M15,40 L20,35 L25,40 M15,80 L20,85 L25,80", strokeWidth: 1 } // Arrows
      ]
  };
}
