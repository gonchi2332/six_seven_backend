import { processReturnQuery } from "../utils/query.util";

/**
 * Busca una plataforma externa por su nombre.
 * @param {string} platfomName - Nombre de la plataforma (ej. 'LinkedIn', 'GitHub').
 * @returns Promesa con el ID de la plataforma.
 */
export async function findPlatforms(platfomName: string) {
  const platformQuery = `
    SELECT id FROM "external_platform" 
    WHERE name = $1
  `;
  return await processReturnQuery(platformQuery, [platfomName]);
}

/**
 * Inserta o actualiza el enlace de un usuario a una plataforma externa.
 * Si ya existe una relación para ese usuario y plataforma, actualiza el enlace.
 * @param {number} platformId - ID de la plataforma externa.
 * @param {string} username - Nombre de usuario.
 * @param {string} linkedinUsername - Enlace o nombre de usuario en la plataforma externa.
 */
export async function insertOrUpdatePlatform(platformId: number, username: string, linkedinUsername: string) {
  const upsertQuery = `
    INSERT INTO "user_platform" (external_platform_id, username, link, visit_count)
    VALUES ($1, $2, $3, 0)
    ON CONFLICT (username, external_platform_id) 
    DO UPDATE SET link = EXCLUDED.link;
  `;
  return await processReturnQuery(upsertQuery, [platformId, username, linkedinUsername]);
}

/**
 * Obtiene el enlace de un usuario para una plataforma específica.
 * @param {string} username - Nombre de usuario.
 * @param {string} platfomName - Nombre de la plataforma externa.
 * @returns Promesa con el enlace (`link`) registrado.
 */
export async function findUserPlatform(username: string, platfomName: string) {
  const getQuery = `
    SELECT up.link
    FROM "user_platform" up
    JOIN "external_platform" ep ON up.external_platform_id = ep.id
    WHERE up.username = $1 AND ep.name = $2
  `;
  return await processReturnQuery(getQuery, [username, platfomName]);
}