import { processReturnQuery } from "../utils/query";
import * as SkillTypes from "../types/skill.types";

export async function getAllUserSkills(username: string, skillType: SkillTypes.SkillType) {
  const skillQuery = `
    SELECT s.name, us.punctuation FROM "user_skill" us
    JOIN "skill" s ON us.skill_id = s.id
    WHERE us.username = $1 AND s.type = $2
  `;
  const userSkills = await processReturnQuery(skillQuery, [username, skillType]);
  return userSkills;
}

export async function getUserSkill(username: string, skillName: string, skillType: SkillTypes.SkillType) {
  const checkQuery = `
     SELECT * FROM "user_skill" us
     JOIN "skill" s ON us.skill_id = s.id
     WHERE us.username = $1 AND s.name = $2 AND s.type = $3
  `;
  const values = [username, skillName, skillType];
  const foundUserSkill = await processReturnQuery(checkQuery, values);
  return foundUserSkill;
}

export async function getOrCreateSkillId(skillName: string, skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT id FROM "skill" 
    WHERE name = $1 AND type = $2
  `;
  const values = [skillName, skillType];
  const skills = await processReturnQuery(selectQuery, values);

  if (skills.length > 0) {
    return skills[0].id;
  }

  const insertQuery = `
    INSERT INTO "skill" (name, type)
    VALUES ($1, 'soft') 
    RETURNING id
  `;
  const newSkill = await processReturnQuery(insertQuery, [skillName]);
  return newSkill[0].id;
}