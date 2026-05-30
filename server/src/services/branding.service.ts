import { askGemini } from "./gemini.service";

export interface BrandingResult {
  brandNames: {
    name: string;
    reasoning: string;
    domain: string;
    score: number;
  }[];
  slogans: {
    text: string;
    tone: string;
  }[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    name: string;
    mood: string;
  };
  typography: {
    heading: string;
    body: string;
    reasoning: string;
  };
  logoConceptes: {
    style: string;
    icon: string;
    description: string;
  }[];
  brandPersonality: string[];
  targetTone: string;
  brandStory: string;
}

export const generateBranding = async (input: {
  startupName: string;
  idea: string;
  industry: string;
  targetAudience: string;
  country: string;
}): Promise<BrandingResult> => {
  const prompt = `
You are a world-class brand strategist and creative director who has built brands for top startups.

Create a complete branding package for this startup:

Name: ${input.startupName}
Idea: ${input.idea}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Market: ${input.country}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "brandNames": [
    {
      "name": "<creative brand name>",
      "reasoning": "<1 sentence why this name works>",
      "domain": "<suggested domain like brandname.com>",
      "score": <number 1-100 how good this name is>
    }
  ],
  "slogans": [
    { "text": "<catchy slogan>", "tone": "<Professional|Playful|Bold|Inspirational|Minimal>" }
  ],
  "colorPalette": {
    "primary": "<hex color>",
    "secondary": "<hex color>",
    "accent": "<hex color>",
    "background": "<hex color>",
    "name": "<palette name like 'Ocean Depth' or 'Sunset Energy'>",
    "mood": "<1 sentence describing the mood this palette creates>"
  },
  "typography": {
    "heading": "<Google Font name for headings>",
    "body": "<Google Font name for body text>",
    "reasoning": "<1 sentence why these fonts work for this brand>"
  },
  "logoConcepts": [
    {
      "style": "<Wordmark|Lettermark|Abstract|Mascot|Emblem|Combination>",
      "icon": "<single emoji that represents the logo concept>",
      "description": "<2 sentence description of the logo concept>"
    }
  ],
  "brandPersonality": ["<trait 1>", "<trait 2>", "<trait 3>", "<trait 4>"],
  "targetTone": "<Voice & tone description in 1 sentence>",
  "brandStory": "<2-3 sentence compelling brand story/origin>"
}

Generate exactly 5 brand names, 5 slogans, 3 logo concepts.
Make everything specific to ${input.industry} in ${input.country}.
Color palette should be unique and memorable, not generic.
`;

  const raw = await askGemini(prompt);
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};