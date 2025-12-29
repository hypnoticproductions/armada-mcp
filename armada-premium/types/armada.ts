// types/armada.ts

// ============================================
// CORRIDOR TYPES
// ============================================

export type Corridor = 
  | 'jamaica' 
  | 'stlucia' 
  | 'uganda' 
  | 'southafrica' 
  | 'nigeria' 
  | 'senegal' 
  | 'london' 
  | 'paris' 
  | 'seoul' 
  | 'tokyo' 
  | 'mumbai' 
  | 'usa' 
  | 'colombia';

export type EmotionalState = 
  | 'hype' 
  | 'swagger' 
  | 'grief' 
  | 'romantic' 
  | 'rage' 
  | 'defiance' 
  | 'spiritual' 
  | 'joy' 
  | 'pride' 
  | 'resilience'
  | 'melancholy' 
  | 'nostalgia' 
  | 'euphoria' 
  | 'sorrow' 
  | 'anger'
  | 'fear' 
  | 'tenderness' 
  | 'excitement' 
  | 'relaxation' 
  | 'energy'
  | 'contemplation' 
  | 'triumph' 
  | 'introspection' 
  | 'rebellion' 
  | 'serenity'
  | 'vibrancy' 
  | 'darkness' 
  | 'passion' 
  | 'somberness' 
  | 'suspense';

export type ValidationPhase = 
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31;

export type CorePhase = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface SongRequest {
  prompt: string;
  corridor: Corridor | string;
  emotionalState: EmotionalState;
  bpm: number;
  genre?: string;
  strictMode?: boolean;
  hybridMode?: boolean;
  secondaryCorridor?: Corridor;
}

export interface SongSection {
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  lyrics: string;
  delivery: string;
  armScore: number;
}

export interface SongResponse {
  id: string;
  title: string;
  sections: SongSection[];
  overallArmScore: number;
  corridorScore: number;
  validationFlags: ValidationFlag[];
  phaseResults?: PhaseResult[];
  metadata: {
    bpm: number;
    genre: string;
    corridor: string;
    emotionalState: string;
    generatedAt: string;
  };
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationFlag {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'novelty' | 'forbidden' | 'corridor' | 'mutation' | 'emotional' | 'governance';
  message: string;
  lineNumber?: number;
  phase?: number;
  suggestion?: string;
}

export interface PhaseResult {
  phase: number;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  score?: number;
  modifications?: string[];
  duration?: number;
  error?: string;
}

export interface ValidationResult {
  line: string;
  original?: string;
  scores: {
    arm: number;
    corridor: number;
    novelty: number;
    economic?: number;
    mythos?: number;
    shadow?: number;
    continental?: number;
  };
  flags: ValidationFlag[];
  phaseResults: PhaseResult[];
}

// ============================================
// CULTURAL INTELLIGENCE TYPES
// ============================================

export interface CulturalReport {
  id: string;
  corridor: Corridor;
  metrics: CulturalMetrics;
  recommendations: string[];
  insights: string[];
  generatedAt: string;
}

export interface CulturalMetrics {
  ili: number; // Institutional Legitimacy Index (0-100)
  cps: number; // Compliance Propensity Score (0-1)
  bfi: number; // Barrier Friction Index (0-1)
  ncb: number; // Network Centrality & Bridge (0-1)
  corridorHarmonization: number; // CHI score (0-1)
}

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface CorridorConfig {
  name: string;
  language: string;
  emotionalTone: string;
  keyPhrases: string[];
  forbiddenWords: string[];
  armThreshold: number;
  culturalAnchors: string[];
}

export interface EmotionalConfig {
  syllablePattern: string;
  pacing: 'slow' | 'moderate' | 'fast';
  vowels: string;
  fields: string[];
}

export interface PhaseConfig {
  id: number;
  name: string;
  description: string;
  critical: boolean;
  duration?: number;
}

export interface SystemConfig {
  armThreshold: number;
  maxRetries: number;
  timeout: number;
  enableAllPhases: boolean;
  keyPhases: number[];
}

// ============================================
// STATE MANAGEMENT TYPES
// ============================================

export interface ValidationState {
  phases: Record<number, PhaseResult>;
  overallScore: number;
  activePhase: number | null;
  isValidating: boolean;
  progress: number;
}

export interface GenerationState {
  isGenerating: boolean;
  currentStep: string;
  progress: number;
  result: SongResponse | null;
  error: string | null;
}

export interface SystemState {
  validation: ValidationState;
  generation: GenerationState;
  isInitialized: boolean;
  lastUpdated: Date | null;
}

// ============================================
// API TYPES
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface GenerateOptions {
  prompt: string;
  corridor: string;
  emotionalState: string;
  bpm: number;
  genre?: string;
  strictMode?: boolean;
  hybridMode?: boolean;
  secondaryCorridor?: string;
}

export interface ValidateOptions {
  content: string;
  corridor: string;
  emotionalState?: string;
  runPhases?: number[];
}

// ============================================
// MCP TOOL TYPES
// ============================================

export interface MCPMessage {
  id: string;
  action: string;
  params: Record<string, unknown>;
}

export interface MCPResponse {
  id: string;
  result?: unknown;
  error?: string;
}

export interface MCPValidationRequest {
  word?: string;
  line?: string;
  sections?: SongSection[];
  corridor: string;
  emotionalState?: string;
  context?: Record<string, unknown>;
}

export interface MCPValidationResponse {
  ok: boolean;
  score?: number;
  line?: string;
  flags?: ValidationFlag[];
  phaseResults?: PhaseResult[];
}

// ============================================
// KNOWLEDGE BASE TYPES
// ============================================

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'json';
  content: string;
  loaded: boolean;
  lastModified: Date;
}

export interface KnowledgeBase {
  pdf: KnowledgeDocument | null;
  textFiles: Record<string, KnowledgeDocument>;
  loaded: boolean;
  loadedAt: Date | null;
}
