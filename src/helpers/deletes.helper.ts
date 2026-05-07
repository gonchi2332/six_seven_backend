import { PoolClient } from "pg";
import { processTransaction, processReturnQuery } from "../utils/query";
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

export async function deleteLaboralExperience(username: string, id: number) {
  const deleteQuery = `
    DELETE FROM "laboral_experience"
    WHERE id = $1 AND username = $2
    RETURNING position
  `;
  const deletedLaboralExperience = await processReturnQuery(deleteQuery, [id, username]);
  return deletedLaboralExperience;
}

export async function deletePersonalProject(projectId: number) {
  await processTransaction(async (client: PoolClient) => {
    const oldLinksQuery = "SELECT link_id FROM \"project_link\" WHERE project_id = $1";
    const oldLinksRes = await client.query(oldLinksQuery, [projectId]);
    const oldLinkIds = oldLinksRes.rows.map(r => r.link_id);
    if (oldLinkIds.length > 0) {
      await client.query("DELETE FROM \"project_link\" WHERE project_id = $1", [projectId]);
      await client.query("DELETE FROM \"link\" WHERE id = ANY($1::int[])", [oldLinkIds]);
    }
    await client.query("DELETE FROM \"project\" WHERE id = $1", [projectId]);
  });
}
