import { processReturnQuery } from "../utils/query";

export async function createUserSkill(skillId: string, username: string, punctuation?: number) {
  let insertQuery, values;
  if(!punctuation) {
    insertQuery = `
      INSERT INTO "user_skill" (skill_id, username) 
      VALUES ($1, $2)
    `;
    values = [skillId, username];
  } else {
    insertQuery = `
      INSERT INTO "user_skill" (skill_id, username, punctuation)
      VALUES ($1, $2, $3)
    `;
    values = [skillId, username, punctuation];
  }
  await processReturnQuery(insertQuery, values);
}