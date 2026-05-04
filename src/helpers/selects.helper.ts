import { processReturnQuery } from "../utils/query";
import * as SkillTypes from "../types/skill.types";

export async function getAllUserSkills(username: string, skillType: SkillTypes.SkillType) {
  let skillQuery;
  if (skillType === "hard") {
    skillQuery = `
      SELECT s.name, us.punctuation FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = $2
    `;
  } else {
    skillQuery = `
      SELECT s.name FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = $2
    `;
  }
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

export async function getSkill(skillName: string, skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT id FROM "skill" 
    WHERE type = $1 AND canon_name = $2
  `;
  const values = [skillType, skillName.toLowerCase()];
  const foundSkill = await processReturnQuery(selectQuery, values);
  return foundSkill;
}

export async function getAllSkillsCanonName(skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT canon_name FROM "skill"
    WHERE type = $1
  `;
  const skills = await processReturnQuery(selectQuery, [skillType]);
  return skills;
}

export async function getAllSkills(skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT name FROM "skill"
    WHERE type = $1
  `;
  const skills = await processReturnQuery(selectQuery, [skillType]);
  return skills;
}