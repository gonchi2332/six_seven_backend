import * as dotenv from "dotenv";

dotenv.config();

function verifyEnvVariables(envVar: string, envValue: string | undefined): string {
  const value = process.env[envVar] || envValue;
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${envVar}`);
  }
  return value;
}

export const env = {
  NODE_ENV: verifyEnvVariables("NODE_ENV", "development"),
  PORT: verifyEnvVariables("PORT", "3000"),
  DB_URL: verifyEnvVariables("DB_URL", undefined),
  LOCAL_DB_URL: verifyEnvVariables("LOCAL_DB_URL", undefined),
  JWT_SECRET: verifyEnvVariables("JWT_SECRET", "default_secret"),
  JWT_EXPIRES_IN: verifyEnvVariables("JWT_EXPIRES_IN", "3600"),
  SEND_EMAIL_HOST: verifyEnvVariables("SEND_EMAIL_HOST", undefined),
  SEND_USER: verifyEnvVariables("SEND_USER", undefined),
  SEND_EMAIL_USER: verifyEnvVariables("SEND_EMAIL_USER", "no-reply"),
  SEND_EMAIL_PASSWORD: verifyEnvVariables("SEND_EMAIL_PASSWORD", undefined)
};