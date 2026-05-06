import { processReturnQuery } from "../utils/query";
import * as SkillTypes from "../types/skill.types";
import * as LaboralExpTypes from "../types/laboralexperience.types";

export async function createSkill(skillName: string, canonSkillName: string, skillType: SkillTypes.SkillType) {
  const insertQuery = `
    INSERT INTO "skill" (name, type, canon_name)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const values = [skillName, skillType, canonSkillName];
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

export async function createLaboralExperience(username: string, laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo) {
  const insertQuery = `
    INSERT INTO "laboral_experience" (position, company_name, description, visible, start_date, 
      end_date, username)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const {
    position,
    companyName,
    description,
    startDate,
    endDate = null
  } = laboralExperienceInfo;
  const values = [position, companyName, description, true, startDate, endDate, username];
  await processReturnQuery(insertQuery, values);
}