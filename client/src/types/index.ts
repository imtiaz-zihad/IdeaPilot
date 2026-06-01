// ── User ──────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: "local" | "google" | "github";
}

// ── Startup ───────────────────────────────────────
export interface Startup {
  _id: string;
  userId: string;
  startupName: string;
  idea: string;
  industry: string;
  targetAudience: string;
  country: string;
  stage: "idea" | "mvp" | "growth" | "scale";
  investorScore?: number;
  createdAt: string;
  updatedAt: string;
}

// ── AI Report ─────────────────────────────────────
export interface AIReport {
  _id: string;
  startupId: string;
  userId: string;
  type: "validation" | "business_plan" | "market_research" | "financial" | "pitch" | "branding";
  result: Record<string, unknown>;
  createdAt: string;
}

// ── Validation ────────────────────────────────────
export interface ValidationDimension {
  score: number;
  label: string;
  summary: string;
}

export interface ValidationResult {
  overallScore: number;
  demand:        ValidationDimension;
  competition:   ValidationDimension;
  monetization:  ValidationDimension;
  scalability:   ValidationDimension;
  risk:          ValidationDimension;
  strengths:     string[];
  weaknesses:    string[];
  opportunities: string[];
  recommendation: string;
}

// ── Branding ──────────────────────────────────────
export interface BrandName {
  name: string;
  reasoning: string;
  domain: string;
  score: number;
}

export interface Slogan {
  text: string;
  tone: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  name: string;
  mood: string;
}

export interface Typography {
  heading: string;
  body: string;
  reasoning: string;
}

export interface LogoConcept {
  style: string;
  icon: string;
  description: string;
}

export interface BrandingResult {
  brandNames:       BrandName[];
  slogans:          Slogan[];
  colorPalette:     ColorPalette;
  typography:       Typography;
  logoConcepts:     LogoConcept[];
  brandPersonality: string[];
  targetTone:       string;
  brandStory:       string;
}

// ── Pitch Deck ────────────────────────────────────
export interface PitchSlide {
  slideNumber: number;
  title:       string;
  subtitle?:   string;
  bullets?:    string[];
  highlight?:  string;
  note?:       string;
}

export interface UseOfFund {
  category:   string;
  percentage: number;
}

export interface PitchDeckResult {
  deckTitle:   string;
  tagline:     string;
  investorAsk: string;
  slides:      PitchSlide[];
  useOfFunds:  UseOfFund[];
}

// ── API ───────────────────────────────────────────
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}