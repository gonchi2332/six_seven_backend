import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

//console.log("--- DEBUG DE CONEXIÓN ---");
//console.log("Entorno detectado:", process.env.NODE_ENV);
//console.log("URL de BD detectada:", process.env.NODE_ENV === "production" ? process.env.DB_URL : process.env.LOCAL_DB_URL);
//console.log("-------------------------");

export function getConextionString() {
  const connectionString = process.env.NODE_ENV === "production" ? process.env.DB_URL : process.env.LOCAL_DB_URL;
  return connectionString;
}

const pool = new Pool({
  connectionString: process.env.NODE_ENV === "production" ? process.env.DB_URL : process.env.LOCAL_DB_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export default pool;