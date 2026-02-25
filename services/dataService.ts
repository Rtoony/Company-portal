

import { ElementType, StandardCard, CadVector, Project, Employee, SearchResult, IncidentReport, SafetyBriefing } from '../types';
import { generateVectorData } from '../constants';

// --- SYSTEM LOGGING ---
export interface SystemLog {
    id: string;
    timestamp: number;
    level: 'INFO' | 'WARN' | 'ERROR' | 'USER';
    message: string;
    module: string;
}

let SYSTEM_LOGS: SystemLog[] = [
    { id: 'log-1', timestamp: Date.now() - 100000, level: 'INFO', message: 'System initialization sequence started', module: 'KERNEL' },
    { id: 'log-2', timestamp: Date.now() - 80000, level: 'INFO', message: 'Database connection established (Pool: 4)', module: 'DB_CONN' },
    { id: 'log-3', timestamp: Date.now() - 60000, level: 'WARN', message: 'High latency detected on node [us-west-2]', module: 'NET' },
    { id: 'log-4', timestamp: Date.now() - 40000, level: 'INFO', message: 'Index rebuild completed (24MB)', module: 'INDEX' },
];

// --- MOCK DATABASE ---
let MOCK_DB: any[] = [
  // LAYERS
  { id: '425', title: 'Layers - Detail', cat: 'LAYERS', subCat: 'DETAIL', desc: 'Layers - Detail - Piping/Schematics Only', protocol: 'Use exclusively for detached detail views. Do not use for plan view geometry.', file: '$BR Prot-detail.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\$BR Prot-detail.dwg' },
  { id: '426', title: 'Layers - Existing', cat: 'LAYERS', subCat: 'EXISTING', desc: 'Layers - Existing Configuration Template', protocol: 'Base template for Topographic Surveys. All layers strictly set to color 8/9/250-254.', file: '$BR PROT-existing.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\$BR PROT-existing.dwg' },
  { id: '427', title: 'Layers - New', cat: 'LAYERS', subCat: 'PROPOSED', desc: 'Layers - New Project Template', protocol: 'Primary Design File. Ensure Linetype Scale (LTSCALE) is set to 1.0 before XREFing.', file: '$BR PROT-new.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\$BR PROT-new.dwg' },
  { id: '503', title: 'Prop Line Note', cat: 'LAYERS', subCat: 'GENERAL', desc: 'Note Setup - Property Line Note & MText Setup', protocol: 'Place on layer C-ANNO-TEXT. Text height must match plot scale factor.', file: 'NOTE SETUP-PROPERTY LINE.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\NOTE SETUP.dwg' },
  { id: '428', title: 'Layers - Demo', cat: 'LAYERS', subCat: 'EXISTING', desc: 'Layers - Demolition Plan Template', protocol: 'Used for Demolition Plans. Layers are frozen in all other viewports.', file: '$BR PROT-demo.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\$BR PROT-demo.dwg' },
  { id: '429', title: 'Layers - Grading', cat: 'LAYERS', subCat: 'PROPOSED', desc: 'Layers - Grading and Drainage Plan', protocol: 'For C3D Surface Styles and Feature Lines only.', file: '$BR PROT-grading.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\$BR PROT-grading.dwg' },

  // MACROS
  { id: '3', title: 'Arrow - Dynamic', cat: 'MACROS', subCat: 'DYNAMIC', desc: 'Fancy Arrow - Dynamic - Adjustable', protocol: 'Grip edit to stretch tail. Double click to rotate head style.', file: 'ARR DYNAMIC.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\ARR DYNAMIC.dwg' },
  { id: '8', title: 'Flow Arrow', cat: 'MACROS', subCat: 'DYNAMIC', desc: 'Flow Arrow - Dynamic Directional', protocol: 'Use for storm drain and sanitary sewer flow direction indicators.', file: 'ARR FLOW2.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\ARR FLOW2.dwg' },
  { id: '857', title: 'Window Dynamic', cat: 'MACROS', subCat: 'DYNAMIC', desc: 'Window Dynamic Block - Resizable', protocol: 'Snap to wall centerlines. Use lookup table for standard manufacturing sizes.', file: 'WINDOW DYNAMIC.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\WINDOW DYNAMIC.dwg' },
  { id: '924', title: 'Vehicle Dynamic', cat: 'MACROS', subCat: 'DYNAMIC', desc: 'Vehicle Dynamic - Configurable Plan View', protocol: 'Select vehicle type via visibility state (Sedan, Truck, SUV).', file: 'VEHICLE DYNAMIC.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\VEHICLE DYNAMIC.dwg' },
  { id: '953', title: 'Tree - Dynamic', cat: 'MACROS', subCat: 'DYNAMIC', desc: 'Tree - Various - Plan & Elevation Views', protocol: 'Use "Plan" visibility for site plans, "Elev" for sections. Randomize rotation for organic look.', file: 'TREE DYNAMIC.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\TREE DYNAMIC.dwg' },
  { id: '793', title: 'Guide Lines', cat: 'MACROS', subCat: 'TOOLS', desc: 'Guide Lines - Dynamic - Insert into Title Block', protocol: 'Insert on Defpoints layer. Do not plot.', file: 'TB GUIDE.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\TB GUIDE.dwg' },

  // SYMBOLS
  { id: '1', title: 'Arrow & Line', cat: 'SYMBOLS', subCat: 'ARROWS', desc: 'Arrow & Line - 1 or 2 ways', file: 'ARR LINE.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\ARR LINE.dwg' },
  { id: '440', title: 'North Arrow', cat: 'SYMBOLS', subCat: 'ARROWS', desc: 'North Arrow - Standard', protocol: 'Must be placed in Paper Space. Rotate to match viewport twist.', file: 'NORTHA2.DWG', path: 'J:\\LIB\\BR\\Palette Tools\\NORTHA2.DWG' },
  { id: '441', title: 'Scale - Std', cat: 'SYMBOLS', subCat: 'ANNOTATION', desc: 'Scale Bar - Standard', protocol: 'Link to viewport annotation scale automatically.', file: 'SCALE.DWG', path: 'J:\\LIB\\BR\\Palette Tools\\SCALE.DWG' },
  { id: '474', title: 'Stamp - DRAFT', cat: 'SYMBOLS', subCat: 'STAMPS', desc: 'Stamp - DRAFT - Not for Construction', protocol: 'Mandatory on all pre-permit plots.', file: 'STAMP DRAFT.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\STAMP DRAFT.dwg' },
  { id: '11', title: 'Star Symbol', cat: 'SYMBOLS', subCat: 'GENERAL', desc: 'Standard Star Marker', file: 'STAR.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\STAR.dwg' },
  { id: '464', title: 'Legend AutoTurn', cat: 'SYMBOLS', subCat: 'LEGENDS', desc: 'Legend - AutoTurn Analysis', file: 'LEGEND AUTOTURN.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\LEGEND AUTOTURN.dwg' },
  { id: '476', title: 'Stamp Submittal', cat: 'SYMBOLS', subCat: 'STAMPS', desc: 'Stamp - __% Submittal Placeholder', file: 'STAMP SUBMIT.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\STAMP SUBMIT.dwg' },

  // BLOCKS
  { id: '42', title: 'Pipe Break', cat: 'BLOCKS', subCat: 'UTILITIES', desc: '00 PIPE BREAK Symbol', protocol: 'Use to indicate pipe continuation on adjacent sheet.', file: '00 PIPE BREAK.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\00 PIPE BREAK.dwg' },
  { id: '446', title: 'Tree - Save', cat: 'BLOCKS', subCat: 'LANDSCAPE', desc: 'Tree - Save - Existing Vegetation', protocol: 'Must correspond with Arborist Report ID tags.', file: 'TREE SAVE.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\TREE SAVE.dwg' },
  { id: '447', title: 'Tree - Remove', cat: 'BLOCKS', subCat: 'LANDSCAPE', desc: 'Tree - Remove - Demolition Plan', protocol: 'Place on C-DEMO-VEG. Verify removal permit status.', file: 'TREE REMOVE.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\TREE REMOVE.dwg' },
  { id: '848', title: 'Bench', cat: 'BLOCKS', subCat: 'LANDSCAPE', desc: 'Site Furniture - Bench', file: 'BENCH.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\BENCH.dwg' },
  { id: '849', title: 'Bike Rack', cat: 'BLOCKS', subCat: 'LANDSCAPE', desc: 'Site Furniture - Bike Rack', file: 'BIKE RACK.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\BIKE RACK.dwg' },
  { id: '850', title: 'Bollard', cat: 'BLOCKS', subCat: 'TRANSPORT', desc: 'Traffic Control - Bollard', protocol: 'Use Fixed or Removable visibility state.', file: 'BOLLARD.DWG', path: 'J:\\LIB\\BR\\Palette Tools\\BOLLARD.DWG' },
  { id: '1063', title: 'Fire Hydrant', cat: 'BLOCKS', subCat: 'UTILITIES', desc: '00 FH - Fire Hydrant Assembly', protocol: 'Align nozzle to street. Ensure 3ft clearance radius.', file: '00 FH.DWG', path: 'J:\\LIB\\BR\\Palette Tools\\00 FH.DWG' },
  { id: '50', title: '02 Flange', cat: 'BLOCKS', subCat: 'GENERAL', desc: '02 FLG - Standard Flange', file: '02 FLG.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\02 FLG.dwg' },
  { id: '52', title: '02 Tee Flange', cat: 'BLOCKS', subCat: 'GENERAL', desc: '02 TEE FLG - Standard Tee', file: '02 TEE FLG.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\02 TEE FLG.dwg' },
  { id: '925', title: 'Fire Truck', cat: 'BLOCKS', subCat: 'TRANSPORT', desc: 'Vehicle - Fire Truck Front View', protocol: 'Used for vertical clearance checks in section view.', file: 'VEHICLE TRUCK FIRE.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\VEHICLE TRUCK.dwg' },

  // DETAILS
  { id: '485', title: 'Title - Detail', cat: 'DETAILS', subCat: 'GENERAL', desc: 'Title - Detail/Section With Bubble - Not To Scale', file: 'TITLE DETAIL.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\TITLE DETAIL.dwg' },
  { id: '31', title: 'Note Sheet', cat: 'DETAILS', subCat: 'GENERAL', desc: 'Sonoma County - Standard Note Sheet for Subdivisions', file: 'NOTE COUNTY.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\NOTE COUNTY.dwg' },
  { id: '449', title: 'Section Angled', cat: 'DETAILS', subCat: 'GENERAL', desc: 'Section With Angle Indicator', file: 'SECTION ANGLED.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\SECTION ANGLED.dwg' },
  { id: '1199', title: 'Yard Drain', cat: 'DETAILS', subCat: 'STORM', desc: 'SD - Yard Drain - Private', protocol: 'Private onsite drainage only. Not for public right-of-way.', file: 'SD - Yard Drain.dwg', path: 'J:\\LIB\\BR\\SD - Yard Drain.dwg' },
  { id: '1200', title: 'Conc Wall', cat: 'DETAILS', subCat: 'ROADWAY', desc: 'Wall - Concrete Construction Detail', file: 'Wall - Concrete.dwg', path: 'J:\\LIB\\BR\\Wall - Concrete.dwg' },
  { id: '466', title: 'Earthwork Table', cat: 'DETAILS', subCat: 'GENERAL', desc: 'Legend - Earthwork Cut/Fill Table', file: 'LEGEND EARTHWORK.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\LEGEND EARTHWORK.dwg' },
  { id: '800', title: 'Cover 11x17', cat: 'DETAILS', subCat: 'GENERAL', desc: 'B&R 11x17 - Cover Sheet Template', file: 'TB COVER BR 11x17.dwg', path: 'J:\\LIB\\BR\\Palette Tools\\TB COVER BR 11x17.dwg' },

  // SPECIFICATIONS
  { id: 'spec-01', title: '00 72 00', cat: 'SPECIFICATIONS', subCat: 'GENERAL', desc: 'General Conditions - Standard Project Requirements', file: '00 72 00 General Conditions.docx', path: 'J:\\LIB\\SPECS\\00 72 00.docx' },
  { id: 'spec-02', title: '31 00 00', cat: 'SPECIFICATIONS', subCat: 'SITEWORK', desc: 'Earthwork - Excavation and Fill', file: '31 00 00 Earthwork.docx', path: 'J:\\LIB\\SPECS\\31 00 00.docx' },
  { id: 'spec-03', title: '33 40 00', cat: 'SPECIFICATIONS', subCat: 'UTILITIES', desc: 'Storm Drainage Utilities - Piping and Structures', file: '33 40 00 Storm Drainage.docx', path: 'J:\\LIB\\SPECS\\33 40 00.docx' },
  { id: 'spec-04', title: '03 30 00', cat: 'SPECIFICATIONS', subCat: 'CONCRETE', desc: 'Cast-in-Place Concrete', file: '03 30 00 Concrete.docx', path: 'J:\\LIB\\SPECS\\03 30 00.docx' },
  { id: 'spec-05', title: '33 30 00', cat: 'SPECIFICATIONS', subCat: 'UTILITIES', desc: 'Sanitary Sewerage Utilities', file: '33 30 00 Sanitary.docx', path: 'J:\\LIB\\SPECS\\33 30 00.docx' },
  { id: 'spec-06', title: '31 10 00', cat: 'SPECIFICATIONS', subCat: 'SITEWORK', desc: 'Site Clearing', file: '31 10 00 Clearing.docx', path: 'J:\\LIB\\SPECS\\31 10 00.docx' },
  { id: 'spec-07', title: '31 23 00', cat: 'SPECIFICATIONS', subCat: 'SITEWORK', desc: 'Excavation and Fill', file: '31 23 00 Excavation.docx', path: 'J:\\LIB\\SPECS\\31 23 00.docx' },
  
  // Extra Mocks
  { id: '9001', title: 'Catch Basin', cat: 'BLOCKS', subCat: 'UTILITIES', desc: 'Standard Catch Basin Plan View', file: 'CB-STD.dwg', path: 'J:\\LIB\\BR\\CB-STD.dwg' },
  { id: '9002', title: 'Cleanout', cat: 'BLOCKS', subCat: 'UTILITIES', desc: 'Sewer Cleanout Symbol', file: 'CO-STD.dwg', path: 'J:\\LIB\\BR\\CO-STD.dwg' },
  { id: '9003', title: 'Water Valve', cat: 'BLOCKS', subCat: 'UTILITIES', desc: 'Gate Valve Symbol', file: 'WV-GATE.dwg', path: 'J:\\LIB\\BR\\WV-GATE.dwg' },
  { id: '9004', title: 'Light Pole', cat: 'BLOCKS', subCat: 'UTILITIES', desc: 'Street Light Standard', file: 'LIGHT-STD.dwg', path: 'J:\\LIB\\BR\\LIGHT-STD.dwg' },
  { id: '9005', title: 'Stop Sign', cat: 'BLOCKS', subCat: 'TRANSPORT', desc: 'R1-1 Stop Sign Symbol', file: 'SIGN-STOP.dwg', path: 'J:\\LIB\\BR\\SIGN-STOP.dwg' },
];

let MOCK_PROJECTS: Project[] = [
  {
    id: '24-105',
    name: 'Smith Creek Subdivision',
    client: 'Lennar Homes',
    location: 'Santa Rosa, CA',
    status: 'ACTIVE',
    phase: 'Construction Docs',
    progress: 65,
    dueDate: '2024-06-15',
    manager: { id: 'pm1', name: 'Sarah J.', role: 'PM' },
    team: [
        { id: 'sur1', name: 'R. Toony', role: 'Lead Surveyor' },
        { id: 'dr1', name: 'Mike D.', role: 'Drafter' }
    ],
    tags: ['Residential', 'Grading', 'Storm'],
    description: 'A 45-lot single family residential subdivision requiring full grading, drainage, and utility improvement plans. Includes a complex detention basin and off-site sewer force main extension.',
    coordinates: { lat: 38.4404, lng: -122.7141 },
    logs: [
        { id: 'log-1', date: '2024-05-10T09:00:00Z', type: 'UPDATE', author: 'Sarah J.', content: 'Received 2nd round comments from City. Drainage calcs need revision to match new rainfall data.' },
        { id: 'log-2', date: '2024-05-12T14:30:00Z', type: 'FIELD', author: 'R. Toony', content: 'Field crew reports heavy brush on North property line. Line of sight blocked for boundary corners. Need clearing crew.' }
    ]
  },
  {
    id: '24-089',
    name: 'Hwy 101 Corridor Widening',
    client: 'CalTrans',
    location: 'Petaluma, CA',
    status: 'HOLD',
    phase: 'Design Development',
    progress: 30,
    dueDate: '2024-09-01',
    manager: { id: 'pm2', name: 'David R.', role: 'PM' },
    team: [
        { id: 'eng1', name: 'Jessica T.', role: 'Civil Lead' }
    ],
    tags: ['Transportation', 'Public Works'],
    description: 'Widening of 2.5 miles of Highway 101 from 2 to 3 lanes. Includes sound wall design, hydraulic study of two culvert crossings, and extensive right-of-way coordination.',
    coordinates: { lat: 38.2324, lng: -122.6367 },
    logs: [
        { id: 'log-3', date: '2024-04-20T10:00:00Z', type: 'ISSUE', author: 'David R.', content: 'Project placed on hold pending CalTrans funding review. Do not bill hours to this job code.' }
    ]
  },
  {
    id: '23-210',
    name: 'City Hall Annex Retrofit',
    client: 'City of Napa',
    location: 'Napa, CA',
    status: 'COMPLETED',
    phase: 'As-Builts',
    progress: 100,
    dueDate: '2024-02-28',
    manager: { id: 'pm1', name: 'Sarah J.', role: 'PM' },
    team: [
        { id: 'dr2', name: 'Tom H.', role: 'Drafter' }
    ],
    tags: ['Commercial', 'Retrofit'],
    description: 'Seismic retrofit and ADA accessibility upgrades for the historic City Hall Annex building. Project scope included site grading for new ramp access and utility relocations.',
    coordinates: { lat: 38.2975, lng: -122.2869 }
  },
  {
    id: '24-112',
    name: 'Oakmont Senior Living',
    client: 'Oakmont Group',
    location: 'Windsor, CA',
    status: 'BIDDING',
    phase: 'Proposal',
    progress: 10,
    dueDate: '2024-04-20',
    manager: { id: 'pm3', name: 'Robert L.', role: 'Principal' },
    team: [],
    tags: ['Commercial', 'Grading'],
    description: 'Proposal for a new 120-unit senior living facility. Scope includes entitlement processing, preliminary grading, and conceptual utility master plan.',
    coordinates: { lat: 38.5471, lng: -122.8164 }
  },
  {
    id: '24-115',
    name: 'Riverside Park Improvements',
    client: 'County Parks',
    location: 'Healdsburg, CA',
    status: 'ACTIVE',
    phase: 'Permitting',
    progress: 85,
    dueDate: '2024-05-10',
    manager: { id: 'pm2', name: 'David R.', role: 'PM' },
    team: [
        { id: 'sur1', name: 'R. Toony', role: 'Lead Surveyor' }
    ],
    tags: ['Public Works', 'Parks'],
    description: 'Renovation of the existing riverside boat launch and parking lot. Includes new permeable paver parking stalls, bio-retention cells, and ADA path of travel upgrades.',
    coordinates: { lat: 38.6105, lng: -122.8692 },
    logs: [
        { id: 'log-4', date: '2024-05-01T11:00:00Z', type: 'MEETING', author: 'David R.', content: 'Meeting with Parks Dept regarding boat ramp ADA compliance. Ramp slope exceeds 8.33%, revision required.' }
    ]
  }
];

let MOCK_EMPLOYEES: Employee[] = [
    { 
        id: 'ENG-101', 
        name: 'Elena Vance', 
        title: 'Senior Civil Engineer', 
        department: 'Engineering', 
        status: 'ACTIVE', 
        email: 'e.vance@acme.com', 
        phone: 'x120', 
        location: 'Office 204', 
        skills: ['Hydrology', 'HEC-RAS', 'Project Mgmt'],
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Elena&backgroundColor=b6e3f4'
    },
    { 
        id: 'CAD-055', 
        name: 'Marcus Thorne', 
        title: 'CAD Technician III', 
        department: 'Engineering', 
        status: 'REMOTE', 
        email: 'm.thorne@acme.com', 
        phone: 'x135', 
        location: 'Remote (OR)', 
        skills: ['Civil 3D', 'LISP', 'ArcGIS'],
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Marcus&backgroundColor=ffdfbf'
    },
    { 
        id: 'MGT-002', 
        name: 'Sarah Jenkins', 
        title: 'Project Manager', 
        department: 'Management', 
        status: 'MEETING', 
        email: 's.jenkins@acme.com', 
        phone: 'x102', 
        location: 'Office 101', 
        skills: ['Client Relations', 'Budgeting', 'Scheduling'],
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sarah&backgroundColor=c0aede'
    },
    { 
        id: 'CAD-089', 
        name: 'David Liu', 
        title: 'Drafter I', 
        department: 'Engineering', 
        status: 'ACTIVE', 
        email: 'd.liu@acme.com', 
        phone: 'x140', 
        location: 'Cubicle 2B', 
        skills: ['AutoCAD', 'Sketchup'],
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=David&backgroundColor=c0aede'
    },
    {
        id: 'SUR-012',
        name: 'Tom Miller',
        title: 'Party Chief',
        department: 'Surveying',
        status: 'FIELD',
        email: 't.miller@acme.com',
        phone: 'Cell-098',
        location: 'Site: Hwy 101',
        skills: ['Trimble GPS', 'Robotic Total Station', 'Construction Staking'],
        avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Tom&backgroundColor=ffdfbf'
    }
];

let MOCK_INCIDENTS: IncidentReport[] = [
    {
        id: 'INC-24-001',
        date: '2024-04-12T10:30:00Z',
        type: 'NEAR_MISS',
        severity: 'HIGH',
        title: 'Trench Collapse Risk',
        description: 'Excavation at Smith Creek site reached 6ft depth without shoring. Crew member entered briefly. Work stopped immediately by foreman.',
        location: 'Smith Creek Subd, Lot 12',
        reportedBy: 'Tom Miller',
        status: 'OPEN',
        aiAnalysis: 'Violation of OSHA 1926.652(a)(1). Excavations >5ft require protective systems. Root cause: Schedule pressure leading to shortcut. Recommended Action: Mandatory trench safety refresher for Crew SUR-A.'
    },
    {
        id: 'INC-24-002',
        date: '2024-05-01T08:15:00Z',
        type: 'PROPERTY_DAMAGE',
        severity: 'LOW',
        title: 'Vehicle Mirror Strike',
        description: 'Survey truck 14 clipped a parked vehicle while backing out of tight driveway. Minor cosmetic damage to truck mirror.',
        location: 'Downtown Petaluma',
        reportedBy: 'R. Toony',
        status: 'CLOSED'
    }
];

export const DataService = {
  
  // --- CORE UTILS ---
  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // --- LOGGING ---
  async fetchLogs(): Promise<SystemLog[]> {
      // Return copy reversed
      return [...SYSTEM_LOGS].reverse();
  },

  addLog(level: 'INFO' | 'WARN' | 'ERROR' | 'USER', message: string, module: string) {
      SYSTEM_LOGS.push({
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          level,
          message,
          module
      });
  },

  // --- LIBRARY CARDS ---
  async fetchCards(category: ElementType): Promise<StandardCard[]> {
    await this.delay(300 + Math.random() * 400); // Simulate network
    const items = MOCK_DB.filter(item => item.cat === category);
    
    // Enrich with vectors
    return items.map(item => ({
        id: item.id,
        title: item.title,
        category: item.cat as ElementType,
        subCategory: item.subCat,
        description: item.desc,
        usageProtocol: item.protocol,
        isFavorite: false, // Handled by app state
        isNew: Math.random() > 0.8,
        filename: item.file,
        fullPath: item.path,
        previewSvg: generateVectorData(item.cat as ElementType, item.subCat, item.id, item.title),
        stats: {
            usage: Math.floor(Math.random() * 100),
            complexity: Math.floor(Math.random() * 10)
        }
    }));
  },

  async addCard(card: Partial<StandardCard>): Promise<StandardCard> {
      await this.delay(500);
      const newCard = {
          id: `${Math.floor(Math.random() * 10000)}`,
          title: card.title || 'Untitled',
          cat: card.category,
          subCat: card.subCategory || 'GENERAL',
          desc: card.description || '',
          protocol: card.usageProtocol,
          file: card.filename || 'new_file.dwg',
          path: `J:\\LIB\\NEW\\${card.filename || 'new_file.dwg'}`
      };
      MOCK_DB.push(newCard);
      this.addLog('INFO', `New Standard Created: ${newCard.title}`, 'LIB');
      
      return {
          ...card,
          id: newCard.id,
          category: newCard.cat as ElementType,
          subCategory: newCard.subCat,
          description: newCard.desc,
          usageProtocol: newCard.protocol,
          filename: newCard.file,
          fullPath: newCard.path,
          isFavorite: false,
          isNew: true,
          previewSvg: generateVectorData(newCard.cat as ElementType, newCard.subCat, newCard.id, newCard.title),
          stats: { usage: 0, complexity: 1 }
      } as StandardCard;
  },

  async updateCard(card: StandardCard): Promise<StandardCard> {
      await this.delay(500);
      const idx = MOCK_DB.findIndex(c => c.id === card.id);
      if (idx !== -1) {
          MOCK_DB[idx] = {
              ...MOCK_DB[idx],
              title: card.title,
              subCat: card.subCategory,
              desc: card.description,
              protocol: card.usageProtocol,
              file: card.filename
          };
          this.addLog('INFO', `Standard Updated: ${card.id}`, 'LIB');
      }
      return card;
  },

  async deleteCard(id: string): Promise<void> {
      await this.delay(500);
      MOCK_DB = MOCK_DB.filter(c => c.id !== id);
      this.addLog('WARN', `Standard Deleted: ${id}`, 'LIB');
  },

  async bulkAddCards(cards: Partial<StandardCard>[]): Promise<void> {
      await this.delay(1000);
      cards.forEach(card => {
          MOCK_DB.push({
              id: `${Math.floor(Math.random() * 100000)}`,
              title: card.title || 'Imported',
              cat: card.category,
              subCat: card.subCategory,
              desc: card.description,
              file: card.filename,
              path: `J:\\LIB\\IMPORT\\${card.filename}`
          });
      });
      this.addLog('INFO', `Bulk Import: ${cards.length} items`, 'LIB');
  },

  // --- PROJECTS ---
  async fetchProjects(): Promise<Project[]> {
      await this.delay(400);
      return [...MOCK_PROJECTS];
  },

  async addProject(project: Partial<Project>): Promise<Project> {
      await this.delay(500);
      const newProj = {
          ...project,
          id: project.id || `24-${Math.floor(Math.random() * 900) + 100}`,
          status: project.status || 'ACTIVE',
          progress: project.progress || 0,
          team: project.team || [],
          manager: project.manager || { id: 'usr', name: 'Current User', role: 'PM' },
          logs: []
      } as Project;
      MOCK_PROJECTS.push(newProj);
      this.addLog('INFO', `Project Opened: ${newProj.id}`, 'PROJ');
      return newProj;
  },

  async updateProject(project: Project): Promise<Project> {
      await this.delay(500);
      const idx = MOCK_PROJECTS.findIndex(p => p.id === project.id);
      if (idx !== -1) {
          MOCK_PROJECTS[idx] = project;
          this.addLog('INFO', `Project Updated: ${project.id}`, 'PROJ');
      }
      return project;
  },

  async deleteProject(id: string): Promise<void> {
      await this.delay(500);
      MOCK_PROJECTS = MOCK_PROJECTS.filter(p => p.id !== id);
      this.addLog('WARN', `Project Deleted: ${id}`, 'PROJ');
  },

  // --- EMPLOYEES ---
  async fetchEmployees(): Promise<Employee[]> {
      await this.delay(400);
      return [...MOCK_EMPLOYEES];
  },

  async addEmployee(emp: Partial<Employee>): Promise<Employee> {
      await this.delay(600);
      const newEmp = {
          ...emp,
          id: emp.id || `EMP-${Math.floor(Math.random() * 1000)}`,
          status: emp.status || 'ACTIVE',
          skills: emp.skills || []
      } as Employee;
      MOCK_EMPLOYEES.push(newEmp);
      this.addLog('INFO', `Personnel Onboarded: ${newEmp.name}`, 'HR');
      return newEmp;
  },

  async updateEmployee(emp: Employee): Promise<Employee> {
      await this.delay(400);
      const idx = MOCK_EMPLOYEES.findIndex(e => e.id === emp.id);
      if (idx !== -1) {
          MOCK_EMPLOYEES[idx] = emp;
          this.addLog('INFO', `Personnel Updated: ${emp.id}`, 'HR');
      }
      return emp;
  },

  async deleteEmployee(id: string): Promise<void> {
      await this.delay(500);
      MOCK_EMPLOYEES = MOCK_EMPLOYEES.filter(e => e.id !== id);
      this.addLog('WARN', `Personnel Offboarded: ${id}`, 'HR');
  },

  // --- SAFETY ---
  async fetchIncidents(): Promise<IncidentReport[]> {
      await this.delay(300);
      return [...MOCK_INCIDENTS];
  },

  async addIncident(inc: Partial<IncidentReport>): Promise<void> {
      await this.delay(500);
      const newInc = {
          ...inc,
          id: `INC-24-${Math.floor(Math.random() * 1000)}`,
          date: new Date().toISOString(),
          status: 'OPEN'
      } as IncidentReport;
      MOCK_INCIDENTS.push(newInc);
      this.addLog('ERROR', `Safety Incident Reported: ${newInc.type}`, 'HSE');
  },

  // --- DASHBOARD AGGREGATION ---
  async getDashboardStats() {
      return {
          activeProjects: MOCK_PROJECTS.filter(p => p.status === 'ACTIVE').length,
          upcomingDeadlines: MOCK_PROJECTS
              .filter(p => p.status === 'ACTIVE' && p.dueDate)
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 3)
              .map(p => ({ name: p.name, date: p.dueDate })),
          fieldCrews: MOCK_EMPLOYEES.filter(e => e.status === 'FIELD').map(e => e.name),
          recentLogs: SYSTEM_LOGS.slice(-5).map(l => l.message)
      };
  },

  // --- SEARCH ---
  async searchGlobal(query: string): Promise<SearchResult[]> {
      await this.delay(200);
      const q = query.toLowerCase();
      const results: SearchResult[] = [];

      // Search Standards
      MOCK_DB.forEach(item => {
          if (item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)) {
              results.push({
                  id: item.id,
                  type: 'STANDARD',
                  title: item.title,
                  subtitle: `${item.cat} // ${item.subCat}`
              });
          }
      });

      // Search Projects
      MOCK_PROJECTS.forEach(p => {
          if (p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) {
              results.push({
                  id: p.id,
                  type: 'PROJECT',
                  title: p.name,
                  subtitle: `Job #${p.id} - ${p.status}`
              });
          }
      });

      // Search Employees
      MOCK_EMPLOYEES.forEach(e => {
          if (e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)) {
              results.push({
                  id: e.id,
                  type: 'EMPLOYEE',
                  title: e.name,
                  subtitle: e.title
              });
          }
      });
      
      // Search Incidents
      MOCK_INCIDENTS.forEach(i => {
           if (i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) {
               results.push({
                   id: i.id,
                   type: 'INCIDENT',
                   title: i.title,
                   subtitle: `Safety ${i.type}`
               });
           }
      });

      return results.slice(0, 10);
  },

  // --- CONTEXT RETRIEVAL FOR RAG ---
  async findContextForRAG(query: string): Promise<string> {
      await this.delay(100);
      // Simple keyword match for demo
      const q = query.toLowerCase();
      const relevantStandards = MOCK_DB.filter(
          item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q)
      ).slice(0, 5);

      if (relevantStandards.length === 0) return "No specific standards found.";

      return relevantStandards.map(s => 
          `STANDARD [[ID:${s.id}]]\nTitle: ${s.title}\nCategory: ${s.cat}\nProtocol: ${s.protocol || 'N/A'}\nDescription: ${s.desc}\n`
      ).join('\n---\n');
  },
};
