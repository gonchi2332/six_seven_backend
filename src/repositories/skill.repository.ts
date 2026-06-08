import { processReturnQuery } from "../utils/query.util";
import * as SkillTypes from "../types/skill.types";

export async function getAllSkills(skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT name FROM "skill"
    WHERE type = $1
  `;
  const skills = await processReturnQuery(selectQuery, [skillType]);
  return skills;
}

export async function getAllSkillsCanonName(skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT canon_name FROM "skill"
    WHERE type = $1
  `;
  const skills = await processReturnQuery(selectQuery, [skillType]);
  return skills;
}