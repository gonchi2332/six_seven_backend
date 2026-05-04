import { env } from "./env.config";
import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: env.GROQ_API_KEY });