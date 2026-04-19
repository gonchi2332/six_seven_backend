import { PoolClient } from "pg";
import { processReturnQuery, processTransaction } from "../utils/processQuery";
import * as SkillTypes from "../types/skill.types";

export async function viewUserHardSkills(username: string) {
  try {
    const checkQuery = `
      SELECT username FROM "user"
      WHERE username = $1
    `;
    const foundedUsers = await processReturnQuery(checkQuery, [username]);
    if (foundedUsers.length === 0) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const skillQuery = `
      SELECT s.name, us.punctuation FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = 'hard'
    `;
    const userSkills = await processReturnQuery(skillQuery, [username]);
    if (userSkills.length === 0) {
      return {
        result: true,
        messageState: "El usuario no tiene habilidades tecnicas registradas.",
      };
    }
    return {
      result: true,
      messageState: `Habilidades tecnicas de ${username} obtenidas correctamente.`,
      skills: userSkills
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function registerUserHardSkill(username: string, skillName: string, punctuation: number) {
  try {
    let checkQuery = `
      SELECT username FROM "user"
      WHERE username = $1
    `;
    const foundedUsers = await processReturnQuery(checkQuery, [username]);
    if (foundedUsers.length === 0) {
      return {
        result: false,
        messageState: "El usuario no existe." 
      };
    }

    checkQuery = `
      SELECT * FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.name = $2
    `;
    const values = [username, skillName];
    const foundedUserSkill = await processReturnQuery(checkQuery, values);
    if (foundedUserSkill.length > 0) {
      return {
        result: false,
        messageState: "La habilidad tecnica a insertar con su puntuacion ya existe"
      };
    }

    await processTransaction<unknown>(async function (client: PoolClient) {
      const skillCheckQuery = `
        SELECT id FROM "skill"
        WHERE name = $1
      `;
      const { rows: foundedSkills } = await client.query(skillCheckQuery, [skillName]);
      let hardSkillId;
      if (foundedSkills.length === 0) {
        const insertQuery = `
          INSERT INTO "skill" (name, type)
          VALUES ($1, $2)
          RETURNING id
        `;
        const values = [skillName, SkillTypes.SkillType.HARDSKILL];
        const { rows: insertedHardSkill } = await client.query(insertQuery, values);
        hardSkillId = insertedHardSkill[0].id;
      } else {
        hardSkillId = foundedSkills[0].id;
      }

      const insertQuery = `
        INSERT INTO "user_skill" (skill_id, username, punctuation)
        VALUES ($1, $2, $3)
      `;
      const values = [hardSkillId, username, punctuation];
      await client.query(insertQuery, values);
    });
    return {
      result: true,
      messageState: `Habilidad tecnica del ${username} registrada correctamente`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}