import { processReturnQuery } from "../utils/query";

export async function userExists(username: string) {
  const checkQuery = `
     SELECT username FROM "user"
     WHERE username = $1
  `;
  const foundUsers = await processReturnQuery(checkQuery, [username]);
  return !(foundUsers.length === 0);
}