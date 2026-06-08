import { processReturnQuery } from "../utils/query.util";
import * as CommonRepository from "./shared/common.repository";
import * as SkillTypes from "../types/skill.types";

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

export async function createUserSkill(skillId: number, username: string, punctuation?: number) {
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

export async function getAllPublicUserSkills(username: string, skillType: SkillTypes.SkillType) {
  let skillQuery;
  if (skillType === "hard") {
    skillQuery = `
      SELECT s.name, us.punctuation 
      FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = $2 AND us.visible = true
    `;
    await CommonRepository.insertInterfaceView(username, 3);
  } else {
    skillQuery = `
      SELECT s.name 
      FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = $2 AND us.visible = true
    `;
    await CommonRepository.insertInterfaceView(username, 2);
  }
  return await processReturnQuery(skillQuery, [username, skillType]);
}

export async function getAllUserSkills(username: string, skillType: SkillTypes.SkillType) {
  let skillQuery;
  if (skillType === "hard") {
    skillQuery = `
      SELECT s.id as skill_id, s.name, us.punctuation, us.visible 
      FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = $2
    `;
  } else {
    skillQuery = `
      SELECT s.id as skill_id, s.name, us.visible 
      FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = $2
    `;
  }
  return await processReturnQuery(skillQuery, [username, skillType]);
}

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

export async function updateSkillsVisibilityBulk(username: string, visibilities: Record<string, boolean>) {
  const queries = Object.entries(visibilities).map(([skillId, isVisible]) => {
    const query = `
      UPDATE "user_skill" 
      SET visible = $1 
      WHERE skill_id = $2 AND username = $3
    `;
    const values = [isVisible, parseInt(skillId, 10), username];
    return processReturnQuery(query, values); 
  });
  await Promise.all(queries);
}