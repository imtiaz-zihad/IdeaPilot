import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // free tier model
});

export const askGemini = async (prompt: string): Promise<string> => {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
};