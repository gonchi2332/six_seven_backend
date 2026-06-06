import { env } from "./env.config";
import Groq from "groq-sdk";
import OpenAI from "openai";

export const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY
});