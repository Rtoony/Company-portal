

export enum ElementType {
  LAYERS = 'LAYERS',
  MACROS = 'MACROS',
  SYMBOLS = 'SYMBOLS',
  BLOCKS = 'BLOCKS',
  DETAILS = 'DETAILS',
  SPECIFICATIONS = 'SPECIFICATIONS'
}

export interface ThemeConfig {
  id: ElementType;
  label: string;
  // Colors are now hex codes or specific tailwind classes for specific uses
  baseColor: string;    // Main background for panels
  accentColor: string;  // Highlights
  textColor: string;    // Text on base
  pattern: string;      // CSS Pattern
  iconName: string;
}

export interface SvgNode {
  tag: string;
  attrs?: Record<string, string | number>;
  children?: SvgNode[];
  content?: string;
}

export interface RecursiveCadVector {
  viewBox: string;
  elements: SvgNode[];
}

// Helper to unify the types for usage (supporting legacy paths or new nodes)
export interface CadVector {
  viewBox: string;
  paths?: { d: string; opacity?: number; strokeWidth?: number; fill?: string }[];
  elements?: SvgNode[];
}

export interface StandardCard {
  id: string;
  title: string;
  category: ElementType;
  subCategory: string;
  description: string;
  usageProtocol?: string; // New field for drafting standards/best practices
  isFavorite: boolean;
  isNew: boolean;
  filename?: string;
  fullPath?: string;
  previewSvg?: CadVector;
  stats: {
    usage: number; // 0-100
    complexity: number; // 0-10
  };
  lastModified?: number;
}

export interface NavButton {
  id: string;
  label: string;
  action: SidebarFilter; // Map button to a specific filter action
  isSpecial?: boolean;
}

export type SidebarFilter = 'ALL' | 'NEW' | 'FAVORITES' | 'FREQUENT';

export interface UserPreferences {
  showGrid: boolean;
  highContrast: boolean;
  defaultExport: 'DWG' | 'PDF' | 'DXF';
  notifications: boolean;
  colorTheme?: 'default' | 'copper' | 'verdant' | 'steel';
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  level: number; // Gamification level (1-10)
  preferences: UserPreferences;
  recentHistory: string[]; // IDs of recently viewed cards
  // Robust Profile Fields
  department?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  status?: string;
  expertise?: string[];
  bio?: string;
  quote?: string;
}

// --- PROJECT MODULE TYPES ---

export type ProjectStatus = 'ACTIVE' | 'HOLD' | 'COMPLETED' | 'ARCHIVED' | 'BIDDING';

export type LogType = 'UPDATE' | 'ISSUE' | 'MEETING' | 'FIELD';

export interface ProjectLogEntry {
  id: string;
  date: string;
  content: string;
  author: string;
  type: LogType;
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string; // PM, Lead, Drafter
  avatarUrl?: string;
}

export interface Project {
  id: string; // Job Number e.g., 24-105
  name: string;
  client: string;
  location: string;
  status: ProjectStatus;
  phase: string; // "Design Development", "Construction Docs", "Permitting"
  progress: number; // 0-100
  dueDate: string;
  manager: ProjectTeamMember;
  team: ProjectTeamMember[];
  tags: string[];
  description?: string; // AI Generated scope
  coordinates?: { lat: number; lng: number }; // For War Room Map
  logs?: ProjectLogEntry[]; // War Room Log
}

// --- PERSONNEL MODULE TYPES ---

export type EmployeeStatus = 'ACTIVE' | 'FIELD' | 'REMOTE' | 'LEAVE' | 'MEETING';

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: 'Engineering' | 'Surveying' | 'Admin' | 'GIS' | 'Management';
  email: string;
  phone: string;
  location: string; // Physical office/site
  status: EmployeeStatus;
  avatarUrl: string;
  skills: string[];
}

// --- SAFETY MODULE TYPES ---
export type IncidentType = 'INJURY' | 'NEAR_MISS' | 'PROPERTY_DAMAGE' | 'ENVIRONMENTAL';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IncidentReport {
    id: string;
    date: string;
    type: IncidentType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    location: string;
    reportedBy: string;
    aiAnalysis?: string; // Root cause & recommendations
    status: 'OPEN' | 'CLOSED' | 'INVESTIGATING';
}

export interface SafetyBriefing {
    id: string;
    date: string;
    topic: string;
    content: string;
    weather: string;
    workType: string;
}

// --- SITE RECON TYPES ---
export interface SiteReconReport {
  id: string;
  location: string;
  timestamp: string;
  analysis: string; // Markdown content
  groundingUrls: { uri: string; title: string }[];
  status: 'PENDING' | 'COMPLETE' | 'ERROR';
}

// --- CHAT TYPES ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- GLOBAL SEARCH TYPES ---
export type SearchResultType = 'STANDARD' | 'PROJECT' | 'EMPLOYEE' | 'COMMAND' | 'INCIDENT';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  metadata?: any; // Extra data for navigation
}

// --- DATABASE SCHEMA TYPES (MIRROR) ---
// These interfaces align with the SQL Schema tables for future backend integration.

export interface DbUser {
  user_id: string;
  username: string;
  email: string;
  display_name?: string;
  role: 'admin' | 'editor' | 'viewer';
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface DbLayerStandard {
  layer_id: string;
  layer_name: string;
  discipline_id: string;
  category_id: string;
  object_id: string;
  description?: string;
  color_aci?: number;
  color_rgb?: string;
  linetype: string;
  lineweight?: number;
  plot_style?: string;
  is_frozen: boolean;
  quality_score: number;
  usage_notes?: string;
}

export interface DbBlockDefinition {
  block_id: string;
  block_name: string;
  category_id: string;
  description?: string;
  source_file?: string;
  preview_image_path?: string;
  is_dynamic: boolean;
  is_annotative: boolean;
  usage_notes?: string;
}

export interface DbProject {
  project_id: string;
  project_number: string;
  project_name: string;
  client_id?: string;
  municipality_id?: string;
  description?: string;
  status: string;
  start_date?: string;
  target_completion?: string;
  project_manager?: string;
  quality_score: number;
}

export interface DbClient {
  client_id: string;
  client_name: string;
  client_code?: string;
  notes?: string;
}

export interface DbProjectOverride {
  override_id: string;
  project_id: string;
  standard_type: string;
  original_standard_id: string;
  override_values: any; // JSONB
  justification: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export interface DbEntityEmbedding {
  embedding_id: string;
  entity_type: string;
  entity_id: string;
  text_content: string;
  created_at: string;
}

export interface DbAuditLog {
  audit_id: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  entity_type: string;
  entity_id: string;
  created_at: string;
}
