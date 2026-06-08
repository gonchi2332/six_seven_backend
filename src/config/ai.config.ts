import { env } from "./env.config";
import Groq from "groq-sdk";
import OpenAI from "openai";

/*El fragmento de código `export const groq = new Groq({ apiKey: env.GROQ_API_KEY });` está creando una nueva
instancia de la clase `Groq` y exportarla como una constante llamada `groq`. La clase `Groq` está siendo
inicializada con un objeto de configuración que incluye una clave API obtenida del
Variable de entorno `env.GROQ_API_KEY`. Esta instancia de `Groq` se puede utilizar para interactuar con el
API de Groq que utiliza la clave API proporcionada para fines de autenticación y autorización. */
export const groq = new Groq({ apiKey: env.GROQ_API_KEY });

/*El fragmento de código crea una nueva instancia de la clase `OpenAI` y la asigna a la
constante `openrouter`. La clase `OpenAI` se está inicializando con un objeto de configuración que
incluye la URL base `"https://openrouter.ai/api/v1"` y una clave API del
`env.OPENROUTER_API_KEY` environment variable. */
export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY
});