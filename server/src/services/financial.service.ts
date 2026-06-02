import { askGemini } from "./gemini.service";

export interface MonthlyProjection {
  month:    number;
  label:    string;
  revenue:  number;
  expenses: number;
  profit:   number;
  users:    number;
}

export interface FinancialResult {
  summary:        string;
  assumptions: {
    pricingModel:     string;
    avgRevenuePerUser: number;
    monthlyExpenses:  number;
    growthRate:       string;
    churnRate:        string;
    cac:              number;
    ltv:              number;
  };
  projections:       MonthlyProjection[];
  breakEvenMonth:    number;
  breakEvenLabel:    string;
  year1Revenue:      number;
  year2Revenue:      number;
  year3Revenue:      number;
  totalFunding:      string;
  burnRate:          number;
  runwayMonths:      number;
  keyMetrics: {
    ltvCacRatio:    string;
    grossMargin:    string;
    paybackPeriod:  string;
    revenueGrowth:  string;
  };
  risks:        string[];
  milestones: {
    label: string;
    month: number;
    description: string;
  }[];
}

export const generateFinancialForecast = async (input: {
  startupName:    string;
  idea:           string;
  industry:       string;
  targetAudience: string;
  country:        string;
  investorScore?: number;
}): Promise<FinancialResult> => {
  const prompt = `
You are a world-class startup CFO and financial modeler with expertise in early-stage company forecasting.

Create a detailed 12-month financial forecast for this startup:

Name: ${input.startupName}
Idea: ${input.idea}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Market: ${input.country}
Investor Score: ${input.investorScore ?? "N/A"}/100

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "summary": "<3-4 sentence executive summary of the financial outlook>",
  "assumptions": {
    "pricingModel": "<e.g. SaaS subscription $29/mo, Commission 8%, Freemium with $49 pro>",
    "avgRevenuePerUser": <monthly revenue per paying user in USD as a number>,
    "monthlyExpenses": <base monthly operating expenses in USD as a number>,
    "growthRate": "<e.g. 15% MoM user growth>",
    "churnRate": "<e.g. 5% monthly churn>",
    "cac": <customer acquisition cost in USD as a number>,
    "ltv": <lifetime value per customer in USD as a number>
  },
  "projections": [
    {
      "month": 1,
      "label": "Month 1",
      "revenue": <number in USD>,
      "expenses": <number in USD>,
      "profit": <number, can be negative>,
      "users": <number of paying users>
    }
  ],
  "breakEvenMonth": <month number 1-12 or 13 if beyond year 1>,
  "breakEvenLabel": "<e.g. Month 8 or Beyond Year 1>",
  "year1Revenue": <total year 1 revenue as number>,
  "year2Revenue": <projected year 2 revenue as number>,
  "year3Revenue": <projected year 3 revenue as number>,
  "totalFunding": "<recommended funding amount e.g. $250K seed round>",
  "burnRate": <average monthly burn rate in USD as number>,
  "runwayMonths": <months of runway with recommended funding as number>,
  "keyMetrics": {
    "ltvCacRatio": "<e.g. 3.2x>",
    "grossMargin": "<e.g. 72%>",
    "paybackPeriod": "<e.g. 4.5 months>",
    "revenueGrowth": "<e.g. 340% YoY>"
  },
  "risks": [
    "<financial risk 1>",
    "<financial risk 2>",
    "<financial risk 3>",
    "<financial risk 4>"
  ],
  "milestones": [
    {
      "label": "<milestone name e.g. First 100 Users>",
      "month": <month number>,
      "description": "<1 sentence description>"
    }
  ]
}

Rules:
- Generate exactly 12 monthly projections (month 1 through 12)
- Revenue and user count must grow realistically — start small, grow gradually
- Expenses should be relatively stable with small increases
- Early months will have negative profit (burn) — this is realistic
- Generate exactly 4 risks
- Generate exactly 5 milestones spread across the 12 months
- All numbers should be realistic for a ${input.industry} startup in ${input.country}
- Make assumptions specific to the industry and business model
`;

  const raw     = await askGemini(prompt);
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};
