import { askGemini } from "./gemini.service";
import { IValidationReport } from "../models/aiReport.model";

interface ValidateInput {
  startupName: string;
  idea: string;
  industry: string;
  targetAudience: string;
  country: string;
}

export const validateStartupIdea = async (
  input: ValidateInput
): Promise<IValidationReport> => {
  const prompt = `
You are a world-class startup analyst and venture capitalist with 20 years of experience evaluating startup ideas.

Analyze this startup idea and return a structured JSON evaluation:

Startup Name: ${input.startupName}
Idea: ${input.idea}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Country/Market: ${input.country}

Return ONLY valid JSON with this exact structure (no markdown, no explanation, just the JSON object):
{
  "overallScore": <number 0-100>,
  "demand": {
    "score": <number 0-100>,
    "label": <"Low" | "Medium" | "High" | "Very High">,
    "summary": "<2 sentence analysis of market demand>"
  },
  "competition": {
    "score": <number 0-100>,
    "label": <"Very Low" | "Low" | "Medium" | "High" | "Very High">,
    "summary": "<2 sentence analysis of competitive landscape>"
  },
  "monetization": {
    "score": <number 0-100>,
    "label": <"Weak" | "Moderate" | "Strong" | "Very Strong">,
    "summary": "<2 sentence analysis of revenue potential>"
  },
  "scalability": {
    "score": <number 0-100>,
    "label": <"Limited" | "Moderate" | "Good" | "Excellent">,
    "summary": "<2 sentence analysis of scaling potential>"
  },
  "risk": {
    "score": <number 0-100>,
    "label": <"Very Low" | "Low" | "Medium" | "High" | "Very High">,
    "summary": "<2 sentence analysis of key risks>"
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
  "recommendation": "<3-4 sentence overall recommendation for this startup>"
}

Be brutally honest and realistic. Base scores on real market conditions for ${input.country}.
`;

  const raw = await askGemini(prompt);

  // Strip markdown code fences if Gemini wraps in ```json
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed: IValidationReport = JSON.parse(cleaned);
  return parsed;
};