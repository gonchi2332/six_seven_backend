import { getClient } from "../config/database.config";
import { PoolClient } from "pg";

export async function processReturnQuery(queryString: string, values: unknown[]) {
  const client = await getClient();
  try {
    const result = await client.query(queryString, values);
    return result.rows;
  } finally {
    client.release();
  }
}

// 2. Para procesos complejos y atómicos (Con transacciones)
export async function processTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}