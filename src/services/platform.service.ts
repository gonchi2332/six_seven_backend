import { processReturnQuery } from "../utils/query";

export async function saveUserLinkedin(username: string, linkedinUsername: string) {
  try {
    const checkUser = await processReturnQuery("SELECT username FROM \"user\" WHERE username = $1", [username]);
    if (checkUser.length === 0) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const platformQuery = "SELECT id FROM \"external_platform\" WHERE name = 'LinkedIn'";
    const platforms = await processReturnQuery(platformQuery, []);
    
    if (platforms.length === 0) {
      return {
        result: false,
        messageState: "La plataforma 'LinkedIn' no está configurada en la base de datos."
      };
    }
    const platformId = platforms[0].id;

    const upsertQuery = `
      INSERT INTO "user_platform" (external_platform_id, username, link, visit_count)
      VALUES ($1, $2, $3, 0)
      ON CONFLICT (username, external_platform_id) 
      DO UPDATE SET link = EXCLUDED.link;
    `;
    await processReturnQuery(upsertQuery, [platformId, username, linkedinUsername]);

    return { 
      result: true, 
      messageState: "Perfil de LinkedIn guardado correctamente." 
    };
  } catch (err) {
    return { 
      result: false, 
      messageState: `Error en el servidor: ${(err as Error).message}` 
    };
  }
}

export async function getUserLinkedin(username: string) {
  try {
    const checkUser = await processReturnQuery("SELECT username FROM \"user\" WHERE username = $1", [username]);
    if (checkUser.length === 0) {
      return { result: false, messageState: "El usuario no existe." };
    }

    const getQuery = `
      SELECT up.link
      FROM "user_platform" up
      JOIN "external_platform" ep ON up.external_platform_id = ep.id
      WHERE up.username = $1 AND ep.name = 'LinkedIn'
    `;
    const userPlatforms = await processReturnQuery(getQuery, [username]);

    if (userPlatforms.length === 0) {
      return { 
        result: true, 
        messageState: "El usuario no tiene un perfil de LinkedIn registrado.",
        linkedinUsername: null
      };
    }

    return { 
      result: true, 
      messageState: "Perfil de LinkedIn obtenido correctamente.",
      linkedinUsername: userPlatforms[0].link 
    };
  } catch (err) {
    return { 
      result: false, 
      messageState: `Error en el servidor: ${(err as Error).message}` 
    };
  }
}
