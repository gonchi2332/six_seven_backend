import { processReturnQuery } from "../utils/processQuery";

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