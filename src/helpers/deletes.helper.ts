import { processReturnQuery } from "../utils/query";
import * as SkillTypes from "../types/skill.types"; 

export async function deleteUserSkill(username: string, skillName: string, skillType: SkillTypes.SkillType) {
  const deleteQuery = `
    DELETE FROM "user_skill" us
    USING "skill" s
    WHERE us.skill_id = s.id AND us.username = $1 AND s.name = $2 AND s.type = $3
    RETURNING us.skill_id
  `;
  const values = [username, skillName, skillType];
  const deletedSkill = await processReturnQuery(deleteQuery, values);
  return deletedSkill;
}