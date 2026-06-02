import { askGemini } from "./gemini.service";

export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  marketShare: string;
}

export interface MarketResearchResult {
  summary: string;
  marketSize: {
    tam: string;
    sam: string;
    som: string;
    growthRate: string;
    source: string;
  };
  swot: {
    strengths:    string[];
    weaknesses:   string[];
    opportunities: string[];
    threats:      string[];
  };
  competitors: Competitor[];
  trends: {
    title:       string;
    description: string;
    impact:      "High" | "Medium" | "Low";
  }[];
  targetAudience: {
    segment:     string;
    size:        string;
    painPoints:  string[];
    willingness: string;
  }[];
  entryBarriers: string[];
  recommendations: string[];
}

export const generateMarketResearch = async (input: {
  startupName:    string;
  idea:           string;
  industry:       string;
  targetAudience: string;
  country:        string;
}): Promise<MarketResearchResult> => {
  const prompt = `
You are a world-class market research analyst with deep expertise in startup ecosystems globally.

Conduct a comprehensive market research report for this startup:

Name: ${input.startupName}
Idea: ${input.idea}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Market: ${input.country}

Return ONLY valid JSON with this exact structure (no markdown, no explanation, just JSON):
{
  "summary": "<3-4 sentence executive summary of the market opportunity>",
  "marketSize": {
    "tam": "<Total Addressable Market with $ figure e.g. $4.2B>",
    "sam": "<Serviceable Addressable Market with $ figure>",
    "som": "<Serviceable Obtainable Market — realistic year 1-2 target>",
    "growthRate": "<CAGR or annual growth rate e.g. 18.5% CAGR>",
    "source": "<Market data reference e.g. Statista 2024, Grand View Research>"
  },
  "swot": {
    "strengths":     ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
    "weaknesses":    ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>", "<opportunity 4>"],
    "threats":       ["<threat 1>", "<threat 2>", "<threat 3>"]
  },
  "competitors": [
    {
      "name": "<competitor name>",
      "description": "<1 sentence what they do>",
      "strengths": ["<strength 1>", "<strength 2>"],
      "weaknesses": ["<weakness 1>", "<weakness 2>"],
      "pricing": "<pricing model e.g. Freemium, $9-49/mo, Commission-based>",
      "marketShare": "<estimated market share or status e.g. Market leader, 15% share, Early stage>"
    }
  ],
  "trends": [
    {
      "title": "<trend title>",
      "description": "<2 sentence description of the trend and its relevance>",
      "impact": "<High|Medium|Low>"
    }
  ],
  "targetAudience": [
    {
      "segment": "<audience segment name>",
      "size": "<estimated size e.g. 2.3M people in ${input.country}>",
      "painPoints": ["<pain point 1>", "<pain point 2>", "<pain point 3>"],
      "willingness": "<willingness to pay description>"
    }
  ],
  "entryBarriers": ["<barrier 1>", "<barrier 2>", "<barrier 3>", "<barrier 4>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>", "<recommendation 4>"]
}

Rules:
- Generate exactly 4 competitors
- Generate exactly 4 market trends
- Generate exactly 2 target audience segments
- Use realistic data specific to ${input.industry} in ${input.country}
- All $ figures should be realistic for the market
- Be specific, not generic
`;

  const raw     = await askGemini(prompt);
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};