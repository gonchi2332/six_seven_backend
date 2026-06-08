import * as dotenv from "dotenv";

/*`dotenv.config();` es una llamada a función que carga las variables de entorno desde un archivo `.env` en
el objeto Node.js `process.env`. Esto permite que la aplicación acceda a las variables de entorno.
definido en el archivo `.env` a lo largo del código. Se usa comúnmente en aplicaciones Node.js para
gestionar configuraciones específicas del entorno. */
dotenv.config();

/**
 * La función `verifyEnvVariables` asegura la presencia de una variable de entorno especificada y
 * devuelve su valor.
 * @param {string} envVar -El parámetro `envVar` es una cadena que representa el nombre del
 * variable de entorno que desea verificar.
 * @param {cadena | undefined} envValue -El parámetro `envValue` en la función `verifyEnvVariables`
 * es una cadena o valor `undefined` que representa el valor predeterminado que se utilizará, si
 * la variable `envVar` no se encuentra o está vacía en el objeto `process.env`.
 * @returns La función `verifyEnvVariables` devuelve el valor de la variable de entorno especificada
 * por `envVar` si existe en el objeto `process.env`. Si la variable de entorno no existe,
 * devuelve el `envValue` proporcionado como alternativa. Si ni la variable de entorno ni el respaldo,
 * el valor está definido, la función arroja un error que indica que falta la variable de entorno.
 */
function verifyEnvVariables(envVar: string, envValue: string | undefined): string {
  const value = process.env[envVar] || envValue;
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${envVar}`);
  }
  return value;
}

/*El bloque `export const env = { ... }` define y exporta un objeto llamado `env` que contiene
varias variables de entorno y sus valores predeterminados. Cada clave en el objeto representa una
variable de entorno, y el valor correspondiente se obtiene llamando a la funcion `verifyEnvVariables`
con el nombre de la variable de entorno y un valor predeterminado si no se encuentra la variable. */
export const env = {
  NODE_ENV: verifyEnvVariables("NODE_ENV", "development"),
  PORT: verifyEnvVariables("PORT", "3000"),
  DB_URL: verifyEnvVariables("DB_URL", undefined),
  LOCAL_DB_URL: verifyEnvVariables("LOCAL_DB_URL", undefined),
  ACCESS_TOKEN_SECRET: verifyEnvVariables("ACCESS_TOKEN_SECRET", "default_secret"),
  REFRESH_TOKEN_SECRET: verifyEnvVariables("REFRESH_TOKEN_SECRET", "default_refresh_secret"),
  SEND_EMAIL_HOST: verifyEnvVariables("SEND_EMAIL_HOST", undefined),
  SEND_USER: verifyEnvVariables("SEND_USER", undefined),
  SEND_EMAIL_USER: verifyEnvVariables("SEND_EMAIL_USER", "no-reply"),
  SEND_EMAIL_PASSWORD: verifyEnvVariables("SEND_EMAIL_PASSWORD", undefined),
  GROQ_API_KEY: verifyEnvVariables("GROQ_API_KEY", undefined),
  GROQ_AI_MODEL: verifyEnvVariables("GROQ_AI_MODEL", "llama-3.1-8b-instant"),
  OPENROUTER_API_KEY: verifyEnvVariables("OPENROUTER_API_KEY", undefined),
  OPENROUTER_AI_MODEL: verifyEnvVariables("OPENROUTER_AI_MODEL", "meta-llama/llama-3.2-11b-vision-instruct"),
  HUGGING_FACE_API_KEY: verifyEnvVariables("HUGGING_FACE_API_KEY", undefined),
  HUGGING_FACE_AI_MODEL: verifyEnvVariables("HUGGING_FACE_AI_MODEL", "Falconsai/nsfw_image_detection"),
};