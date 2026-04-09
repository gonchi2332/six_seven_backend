import { getClient } from "../config/database.config";

export async function processQuery(queryString: string, values: unknown[]) {
  const client = await getClient();
  try {
    client.query("BEGIN");
    client.query(queryString, values);
    client.query("COMMIT");  
  } catch (err) {
    client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function processReturnQuery(queryString: string, values: unknown[]) {
  const client = await getClient();
  try {
    client.query("BEGIN");
    const answer = client.query(queryString, values);
    client.query("COMMIT");
    return answer;
  } catch (err) {
    client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}