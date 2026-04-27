import { PoolClient } from "pg";
import { processReturnQuery, processTransaction } from "../utils/processQuery";
import * as SkillTypes from "../types/skill.types";

export async function viewUserHardSkills(username: string) {
  try {
    const checkQuery = `
     SELECT username FROM "user"
     WHERE username = $1
   `;
    const foundUsers = await processReturnQuery(checkQuery, [username]);
    if (foundUsers.length === 0) {
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
    const foundUsers = await processReturnQuery(checkQuery, [username]);
    if (foundUsers.length === 0) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    checkQuery = `
     SELECT id FROM "skill"
     WHERE name = $1
   `;
    let foundSkills = await processReturnQuery(checkQuery, [skillName]);
    if (foundSkills.length === 0) {
      const insertQuery = `
        INSERT INTO "skill" (name, type)
        VALUES ($1, $2)
        RETURNING id
      `;
      const values = [skillName, SkillTypes.SkillType.HARDSKILL];
      foundSkills = await processReturnQuery(insertQuery, values);
    }

    checkQuery = `
     SELECT * FROM "user_skill" us
     JOIN "skill" s ON us.skill_id = s.id
     WHERE us.username = $1 AND s.name = $2
   `;
    const values = [username, skillName];
    const foundUserSkill = await processReturnQuery(checkQuery, values);
    if (foundUserSkill.length > 0) {
      return {
        result: false,
        messageState: "La habilidad tecnica a insertar con su puntuacion ya existe."
      };
    }

    const hardSkillId = foundSkills[0].id;

    await processTransaction<unknown>(async function (client: PoolClient) {
      const insertQuery = `
       INSERT INTO "user_skill" (skill_id, username, punctuation)
       VALUES ($1, $2, $3)
     `;
      const values = [hardSkillId, username, punctuation];
      await client.query(insertQuery, values);
    });
    return {
      result: true,
      messageState: `Habilidad tecnica de ${username} registrada correctamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function modifyUserHardSkill(username: string, skillName: string, newPunctuation: number) {
  try {
    let checkQuery = `
     SELECT username FROM "user"
     WHERE username = $1
   `;
    const foundUsers = await processReturnQuery(checkQuery, [username]);
    if (foundUsers.length === 0) {
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
    const foundUserSkill = await processReturnQuery(checkQuery, values);
    if (foundUserSkill.length === 0) {
      return {
        result: false,
        messageState: "La habilidad tecnica a modificar no esta asociada a este usuario."
      };
    }
    if (foundUserSkill[0].punctuation === newPunctuation) {
      return {
        result: false,
        messageState: "No se puede modificar la habilidad tecnica asociada, el valor de puntuacion es el mismo."
      };
    }

    const updateQuery = `
      UPDATE "user_skill" us
      SET punctuation = $1
      FROM "skill" s
      WHERE us.skill_id = s.id AND us.username = $2 AND s.name = $3
   `;
    const queryValues = [newPunctuation, username, skillName];
    await processReturnQuery(updateQuery, queryValues);

    return {
      result: true,
      messageState: `Habilidad tecnica de ${username} modificada correctamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function deleteUserHardSkill(username: string, skillName: string) {
  try {
    let checkQuery = `
      SELECT username FROM "user"
      WHERE username = $1 
    `;
    const foundUsers = await processReturnQuery(checkQuery, [username]);
    if (foundUsers.length === 0) {
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
    const foundUserSkills = await processReturnQuery(checkQuery, values);
    if (foundUserSkills.length === 0) {
      return {
        result: false,
        messageState: "La habilidad tecnica a eliminar no esta asociada a este usuario."
      };
    }

    const deleteQuery = `
      DELETE FROM "user_skill" us
      USING "skill" s
      WHERE us.skill_id = s.id AND us.username = $1 AND s.name = $2
    `;
    await processReturnQuery(deleteQuery, values);

    return {
      result: true,
      messageState: `Habilidad tecnica de ${username} eliminada correctamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function registerUserSoftSkill(username: string, skillName: string) {
  try {
    const checkUser = await processReturnQuery("SELECT username FROM \"user\" WHERE username = $1", [username]);
    if (checkUser.length === 0) return { result: false, messageState: "El usuario no existe." };

    const softSkillId = await getOrCreateSkillId(skillName);

    const checkQuery = "SELECT * FROM \"user_skill\" WHERE username = $1 AND skill_id = $2";
    const foundUserSkill = await processReturnQuery(checkQuery, [username, softSkillId]);

    if (foundUserSkill.length > 0) {
      return {
        result: false,
        messageState: "El usuario ya tiene registrada esta habilidad blanda."
      };
    }

    const insertQuery = "INSERT INTO \"user_skill\" (skill_id, username) VALUES ($1, $2)";
    await processReturnQuery(insertQuery, [softSkillId, username]);

    return {
      result: true,
      messageState: "La habilidad es agregada a la lista de habilidades blandas."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

async function getOrCreateSkillId(skillName: string): Promise<number> {
  const selectQuery = "SELECT id FROM \"skill\" WHERE name = $1 AND type = 'soft'";
  const skills = await processReturnQuery(selectQuery, [skillName]);

  if (skills.length > 0) {
    return skills[0].id;
  }

  const insertQuery = "INSERT INTO \"skill\" (name, type) VALUES ($1, 'soft') RETURNING id";
  const newSkill = await processReturnQuery(insertQuery, [skillName]);
  return newSkill[0].id;
}

export async function viewUserSoftSkills(username: string) {
  try {
    const checkUser = await processReturnQuery("SELECT username FROM \"user\" WHERE username = $1", [username]);
    if (checkUser.length === 0) return {
      result: false,
      messageState: "El usuario no existe."
    };

    const skillQuery = `
      SELECT s.name FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = 'soft'
    `;
    const userSkills = await processReturnQuery(skillQuery, [username]);

    if (userSkills.length === 0) {
      return {
        result: true,
        messageState: "El usuario no tiene habilidades blandas registradas.",
        skills: []
      };
    }

    return {
      result: true,
      messageState: `Habilidades blandas de ${username} obtenidas correctamente.`,
      skills: userSkills
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function modifyUserSoftSkill(username: string, oldSkillName: string, newSkillName: string) {
  try {
    const oldSkillCheck = await processReturnQuery(`
      SELECT us.skill_id FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.name = $2 AND s.type = 'soft'
    `, [username, oldSkillName]);

    if (oldSkillCheck.length === 0) {
      return {
        result: false,
        messageState: "La habilidad blanda a modificar no está asociada a este usuario."
      };
    }
    const oldSkillId = oldSkillCheck[0].skill_id;

    const newSkillId = await getOrCreateSkillId(newSkillName);

    const alreadyHasNew = await processReturnQuery(`
      SELECT * FROM "user_skill" WHERE username = $1 AND skill_id = $2
    `, [username, newSkillId]);

    if (alreadyHasNew.length > 0 && oldSkillId !== newSkillId) {
      return {
        result: false,
        messageState: "El usuario ya posee la habilidad a la que intenta cambiar."
      };
    }

    const updateQuery = `
      UPDATE "user_skill"
      SET skill_id = $1
      WHERE username = $2 AND skill_id = $3
    `;
    await processReturnQuery(updateQuery, [newSkillId, username, oldSkillId]);

    return {
      result: true,
      messageState: "Habilidad modificada correctamente"
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function deleteUserSoftSkill(username: string, skillName: string) {
  try {
    const deleteQuery = `
      DELETE FROM "user_skill" us
      USING "skill" s
      WHERE us.skill_id = s.id AND us.username = $1 AND s.name = $2 AND s.type = 'soft'
      RETURNING us.skill_id
    `;
    const deleted = await processReturnQuery(deleteQuery, [username, skillName]);

    if (deleted.length === 0) {
      return {
        result: false,
        messageState: "La habilidad blanda no está asociada a este usuario o no existe."
      };
    }

    return {
      result: true,
      messageState: "Habilidad blanda eliminada correctamente."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}
