import { askGemini } from "./gemini.service";
import { Message } from "../models/message.model";
import { Startup } from "../models/startup.model";
import { AIReport } from "../models/aiReport.model";
import mongoose from "mongoose";

export const buildStartupContext = async (
  startupId: string,
  userId: string
): Promise<string> => {
  const startup = await Startup.findOne({
    _id: startupId,
    userId,
  });
  if (!startup) throw new Error("Startup not found");

  // Fetch existing AI reports for richer context
  const reports = await AIReport.find({ startupId }).lean();

  const validationReport = reports.find(r => r.type === "validation");
  const marketReport     = reports.find(r => r.type === "market_research");
  const financialReport  = reports.find(r => r.type === "financial");
  const brandingReport   = reports.find(r => r.type === "branding");

  let context = `
You are an expert AI co-founder and startup advisor. You have deep knowledge about this startup and help the founder make smart decisions.

=== STARTUP PROFILE ===
Name: ${startup.startupName}
Idea: ${startup.idea}
Industry: ${startup.industry}
Target Audience: ${startup.targetAudience}
Country/Market: ${startup.country}
Stage: ${startup.stage}
Investor Score: ${startup.investorScore ?? "Not yet validated"}/100
`;

  if (validationReport?.result) {
    const v = validationReport.result as any;
    context += `
=== AI VALIDATION RESULTS ===
Overall Score: ${v.overallScore}/100
Market Demand: ${v.demand?.score}/100 — ${v.demand?.label}
Competition: ${v.competition?.score}/100 — ${v.competition?.label}
Monetization: ${v.monetization?.score}/100 — ${v.monetization?.label}
Scalability: ${v.scalability?.score}/100 — ${v.scalability?.label}
Risk Level: ${v.risk?.score}/100 — ${v.risk?.label}
Recommendation: ${v.recommendation}
`;
  }

  if (marketReport?.result) {
    const m = marketReport.result as any;
    context += `
=== MARKET RESEARCH ===
Market Summary: ${m.summary}
TAM: ${m.marketSize?.tam}
SAM: ${m.marketSize?.sam}
SOM: ${m.marketSize?.som}
Growth Rate: ${m.marketSize?.growthRate}
`;
  }

  if (financialReport?.result) {
    const f = financialReport.result as any;
    context += `
=== FINANCIAL FORECAST ===
Year 1 Revenue: $${f.year1Revenue?.toLocaleString()}
Break-even: ${f.breakEvenLabel}
Burn Rate: $${f.burnRate?.toLocaleString()}/month
Runway: ${f.runwayMonths} months
Recommended Funding: ${f.totalFunding}
`;
  }

  if (brandingReport?.result) {
    const b = brandingReport.result as any;
    const topName = b.brandNames?.[0]?.name;
    const topSlogan = b.slogans?.[0]?.text;
    context += `
=== BRANDING ===
Top Brand Name: ${topName ?? "Not generated"}
Top Slogan: ${topSlogan ?? "Not generated"}
Brand Story: ${b.brandStory ?? "Not generated"}
`;
  }

  context += `
=== YOUR ROLE ===
- You are the founder's AI co-founder and strategic advisor
- Give specific, actionable advice based on the startup data above
- Reference the actual data (scores, market size, etc.) when relevant
- Be concise but insightful — 2-4 paragraphs max per response
- Ask clarifying questions when needed
- Help with strategy, product, marketing, fundraising, hiring, and operations
- Always be encouraging but honest about challenges
`;

  return context;
};

export const getChatHistory = async (
  startupId: string,
  userId: string,
  limit = 20
) => {
  return Message.find({ startupId, userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const sendMessage = async (
  startupId: string,
  userId: string,
  userMessage: string
): Promise<string> => {
  // Save user message
  await Message.create({
    startupId: new mongoose.Types.ObjectId(startupId),
    userId:    new mongoose.Types.ObjectId(userId),
    role:      "user",
    content:   userMessage,
  });

  // Get recent history for context (last 10 messages)
  const history = await Message.find({ startupId, userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const historyText = history
    .reverse()
    .slice(0, -1) // exclude the message we just saved
    .map(m => `${m.role === "user" ? "Founder" : "AI Co-Founder"}: ${m.content}`)
    .join("\n");

  // Build full prompt
  const systemContext = await buildStartupContext(startupId, userId);

  const prompt = `
${systemContext}

=== CONVERSATION HISTORY ===
${historyText || "This is the start of the conversation."}

=== CURRENT MESSAGE ===
Founder: ${userMessage}

AI Co-Founder:`;

  const aiResponse = await askGemini(prompt);

  // Save AI response
  await Message.create({
    startupId: new mongoose.Types.ObjectId(startupId),
    userId:    new mongoose.Types.ObjectId(userId),
    role:      "assistant",
    content:   aiResponse.trim(),
  });

  return aiResponse.trim();
};

export const clearChatHistory = async (
  startupId: string,
  userId: string
): Promise<void> => {
  await Message.deleteMany({ startupId, userId });
};