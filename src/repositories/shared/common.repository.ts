import { processReturnQuery } from "../../utils/query.util";

export async function findByUsername(username: string) {
  const checkQuery = `
    SELECT username FROM "user" 
    WHERE username = $1`;
  return await processReturnQuery(checkQuery, [username]);
}

export async function userExists(username: string) {
  const checkQuery = `
    SELECT username FROM "user"
    WHERE username = $1
  `;
  const foundUsers = await processReturnQuery(checkQuery, [username]);
  return !(foundUsers.length === 0);
}

export async function insertInterfaceView(username: string, interfaceId: number) {
  const query = `
    INSERT INTO "interface_view" (username, interface_id)
    VALUES ($1, $2);
  `;
  const result = await processReturnQuery(query, [username, interfaceId]);
  return result[0];
}