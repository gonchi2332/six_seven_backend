import { processReturnQuery } from "../utils/query";

export async function updateUserHardSkill(newPunctuation: number, username: string, skillName: string) {
  const updateQuery = `
    UPDATE "user_skill" us
    SET punctuation = $1
    FROM "skill" s
    WHERE us.skill_id = s.id AND us.username = $2 AND s.name = $3
  `;
  const queryValues = [newPunctuation, username, skillName];
  await processReturnQuery(updateQuery, queryValues);
}