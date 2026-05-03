import { processReturnQuery } from "../utils/query";
import * as SkillTypes from "../types/skill.types";

export async function createSkill(skillName: string, skillType: SkillTypes.SkillType) {
  const insertQuery = `
    INSERT INTO "skill" (name, type, canon_name)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const values = [skillName, skillType, skillName.toLowerCase()];
  const createdSkill = await processReturnQuery(insertQuery, values);
  return createdSkill; 
}

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