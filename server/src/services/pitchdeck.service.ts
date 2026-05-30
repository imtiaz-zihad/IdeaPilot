import { askGemini } from "./gemini.service";

export interface PitchSlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets?: string[];
  highlight?: string;
  note?: string;
}

export interface PitchDeckResult {
  deckTitle: string;
  tagline: string;
  slides: PitchSlide[];
  investorAsk: string;
  useOfFunds: { category: string; percentage: number }[];
}

export const generatePitchDeck = async (input: {
  startupName: string;
  idea: string;
  industry: string;
  targetAudience: string;
  country: string;
  investorScore?: number;
}): Promise<PitchDeckResult> => {
  const prompt = `
You are a world-class startup pitch consultant who has helped companies raise millions in funding.

Create a complete 12-slide investor pitch deck for this startup:

Name: ${input.startupName}
Idea: ${input.idea}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Market: ${input.country}
Investor Score: ${input.investorScore || "N/A"}/100

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "deckTitle": "${input.startupName}",
  "tagline": "<one powerful tagline for the company>",
  "investorAsk": "<e.g. Raising $500K pre-seed to expand to 3 cities>",
  "useOfFunds": [
    { "category": "Product Development", "percentage": 40 },
    { "category": "Marketing", "percentage": 25 },
    { "category": "Operations", "percentage": 20 },
    { "category": "Team", "percentage": 15 }
  ],
  "slides": [
    {
      "slideNumber": 1,
      "title": "Cover",
      "subtitle": "${input.startupName} — <tagline>",
      "highlight": "<one sentence mission statement>",
      "note": "<presenter note for this slide>"
    },
    {
      "slideNumber": 2,
      "title": "The Problem",
      "subtitle": "<problem statement headline>",
      "bullets": ["<specific problem point 1>", "<specific problem point 2>", "<specific problem point 3>"],
      "highlight": "<the core pain point in one sentence>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 3,
      "title": "Our Solution",
      "subtitle": "<solution headline>",
      "bullets": ["<how it solves problem 1>", "<how it solves problem 2>", "<key differentiator>"],
      "highlight": "<one sentence value proposition>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 4,
      "title": "Market Opportunity",
      "subtitle": "A massive and growing market",
      "bullets": ["TAM: <total addressable market with $ figure>", "SAM: <serviceable addressable market>", "SOM: <target market share year 1>"],
      "highlight": "<market growth rate or key statistic>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 5,
      "title": "Product",
      "subtitle": "How it works",
      "bullets": ["<core feature 1>", "<core feature 2>", "<core feature 3>", "<core feature 4>"],
      "highlight": "<the one thing that makes this product special>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 6,
      "title": "Business Model",
      "subtitle": "How we make money",
      "bullets": ["<revenue stream 1 with pricing>", "<revenue stream 2>", "<unit economics or margins>"],
      "highlight": "<LTV or key revenue metric>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 7,
      "title": "Traction",
      "subtitle": "Early momentum",
      "bullets": ["<traction point 1 — users, revenue, partnerships>", "<traction point 2>", "<traction point 3>"],
      "highlight": "<most impressive traction metric>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 8,
      "title": "Competitive Landscape",
      "subtitle": "Why we win",
      "bullets": ["<competitor 1 and their weakness>", "<competitor 2 and their weakness>", "<our key competitive advantage>"],
      "highlight": "<our unfair advantage in one sentence>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 9,
      "title": "Go-To-Market Strategy",
      "subtitle": "How we acquire customers",
      "bullets": ["Phase 1: <initial GTM strategy>", "Phase 2: <scale strategy>", "Phase 3: <expansion strategy>"],
      "highlight": "<primary acquisition channel and CAC estimate>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 10,
      "title": "Financial Projections",
      "subtitle": "Path to profitability",
      "bullets": ["Year 1: <revenue projection>", "Year 2: <revenue projection>", "Year 3: <revenue projection>", "Break-even: <timeline>"],
      "highlight": "<key financial milestone>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 11,
      "title": "The Team",
      "subtitle": "Built to execute",
      "bullets": ["<Founder role and relevant background>", "<Co-founder or key hire>", "<Advisory board or key advisor>"],
      "highlight": "<why this team is uniquely positioned to win>",
      "note": "<presenter note>"
    },
    {
      "slideNumber": 12,
      "title": "The Ask",
      "subtitle": "Join us on this journey",
      "bullets": ["<funding amount and round>", "<primary use of funds>", "<key milestone this funding achieves>"],
      "highlight": "<compelling closing statement>",
      "note": "<presenter note>"
    }
  ]
}

Make all content highly specific to ${input.industry} in ${input.country}.
Use realistic numbers and market data.
Be compelling and investor-focused.
`;

  const raw = await askGemini(prompt);
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};