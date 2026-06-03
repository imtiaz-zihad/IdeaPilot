import { askGemini } from "./gemini.service";

export interface BusinessPlanResult {
  executiveSummary: string;
  problemStatement: string;
  solution: string;
  valueProposition: string;
  revenueModel: {
    streams: {
      name:        string;
      description: string;
      percentage:  number;
    }[];
    pricingStrategy: string;
    unitEconomics:   string;
  };
  customerSegments: {
    segment:     string;
    description: string;
    size:        string;
    priority:    "Primary" | "Secondary";
  }[];
  goToMarket: {
    phase:       string;
    timeline:    string;
    strategy:    string;
    channels:    string[];
    kpi:         string;
  }[];
  competitiveAdvantage: string[];
  operationalPlan: {
    teamStructure:  string[];
    keyActivities:  string[];
    keyResources:   string[];
    keyPartnerships: string[];
  };
  growthStrategy: {
    shortTerm:  string;
    midTerm:    string;
    longTerm:   string;
  };
  successMetrics: {
    metric: string;
    target: string;
    timeline: string;
  }[];
  conclusion: string;
}

export const generateBusinessPlan = async (input: {
  startupName:    string;
  idea:           string;
  industry:       string;
  targetAudience: string;
  country:        string;
  investorScore?: number;
}): Promise<BusinessPlanResult> => {
  const prompt = `
You are a world-class startup consultant and business strategist who has helped hundreds of companies raise funding and scale.

Create a comprehensive business plan for this startup:

Name: ${input.startupName}
Idea: ${input.idea}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Market: ${input.country}
Investor Score: ${input.investorScore ?? "N/A"}/100

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "executiveSummary": "<4-5 sentence compelling overview of the business opportunity, solution, and potential>",
  "problemStatement": "<2-3 sentence clear description of the problem being solved and its impact>",
  "solution": "<2-3 sentence description of how the product/service solves the problem>",
  "valueProposition": "<1-2 sentence unique value proposition statement>",
  "revenueModel": {
    "streams": [
      {
        "name": "<revenue stream name>",
        "description": "<1 sentence description>",
        "percentage": <estimated % of total revenue as number>
      }
    ],
    "pricingStrategy": "<2-3 sentence pricing strategy description>",
    "unitEconomics": "<2-3 sentence description of unit economics including margins>"
  },
  "customerSegments": [
    {
      "segment": "<segment name>",
      "description": "<1-2 sentence description>",
      "size": "<estimated size e.g. 500K users in ${input.country}>",
      "priority": "<Primary|Secondary>"
    }
  ],
  "goToMarket": [
    {
      "phase": "<phase name e.g. Phase 1: Launch>",
      "timeline": "<e.g. Month 1-3>",
      "strategy": "<2 sentence strategy description>",
      "channels": ["<channel 1>", "<channel 2>", "<channel 3>"],
      "kpi": "<primary KPI for this phase>"
    }
  ],
  "competitiveAdvantage": [
    "<advantage 1>",
    "<advantage 2>",
    "<advantage 3>",
    "<advantage 4>"
  ],
  "operationalPlan": {
    "teamStructure": ["<role 1>", "<role 2>", "<role 3>", "<role 4>"],
    "keyActivities": ["<activity 1>", "<activity 2>", "<activity 3>", "<activity 4>"],
    "keyResources": ["<resource 1>", "<resource 2>", "<resource 3>"],
    "keyPartnerships": ["<partnership 1>", "<partnership 2>", "<partnership 3>"]
  },
  "growthStrategy": {
    "shortTerm": "<0-6 months growth strategy>",
    "midTerm": "<6-18 months growth strategy>",
    "longTerm": "<18+ months growth strategy>"
  },
  "successMetrics": [
    {
      "metric": "<metric name>",
      "target": "<target value>",
      "timeline": "<timeline to achieve>"
    }
  ],
  "conclusion": "<2-3 sentence powerful closing statement about the opportunity>"
}

Rules:
- Generate exactly 3 revenue streams that add up to 100%
- Generate exactly 3 customer segments
- Generate exactly 3 GTM phases
- Generate exactly 5 success metrics
- Make everything specific to ${input.industry} in ${input.country}
- Be detailed, specific and investor-focused
`;

  const raw     = await askGemini(prompt);
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};