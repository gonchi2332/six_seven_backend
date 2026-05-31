import { env } from "../config/env.config";
import { InferenceClient } from "@huggingface/inference";

export const hf = new InferenceClient(env.HUGGING_FACE_API_KEY);