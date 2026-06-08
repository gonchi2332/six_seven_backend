import { processReturnQuery } from "../utils/query.util";

/**
 * Obtiene el enlace de perfil público de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con el `public_profile_link`.
 */
export async function getProfileLink(username: string) {
  const querySelect = `
    SELECT public_profile_link FROM "user"
    WHERE username = $1
  `;
  return await processReturnQuery(querySelect, [username]);
}

/**
 * Actualiza el enlace de perfil público de un usuario.
 * @param {string} publicLink - Nuevo hash/enlace público.
 * @param {string} username - Nombre de usuario.
 */
export async function updateProfileLink(publicLink: string, username: string) {
  const queryUpdate = `
    UPDATE "user"
    SET public_profile_link = $1
    WHERE username = $2
  `;
  const values = [publicLink, username];
  return await processReturnQuery(queryUpdate, values);
}

/**
 * Obtiene una lista básica de todos los usuarios verificados en el sistema.
 * @returns Promesa con una lista de objetos conteniendo `username`, `names` y `first_surname`.
 */
export async function getAllBasicUsers() {
  const selectQuery = `
    SELECT username, names, first_surname
    FROM "user"
    WHERE state = 'verified'
    ORDER BY names ASC
  `;
  const users = await processReturnQuery(selectQuery, []);
  return users;
}

/**
 * Verifica la existencia de datos visibles en las diferentes secciones del perfil de un usuario.
 * Comprueba proyectos, educación, certificados, experiencia laboral y habilidades (técnicas y blandas).
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con un objeto conteniendo booleanos para cada sección (`has_projects`, `has_education`, etc.).
 */
export async function getUserSectionsVisibility(username: string) {
  const query = `
    SELECT
      EXISTS (SELECT 1 FROM "project" WHERE username = $1 AND visible = true) as has_projects,
      EXISTS (SELECT 1 FROM "academic_training" WHERE username = $1 AND visible = true) as has_education,
      EXISTS (SELECT 1 FROM "certificate" WHERE username = $1 AND visible = true) as has_certificates,
      EXISTS (SELECT 1 FROM "laboral_experience" WHERE username = $1 AND visible = true) as has_work_experience,
      EXISTS (
        SELECT 1 FROM "user_skill" us 
        JOIN "skill" s ON us.skill_id = s.id 
        WHERE us.username = $1 AND us.visible = true AND s.type = 'soft'
      ) as has_soft_skills,
      EXISTS (
        SELECT 1 FROM "user_skill" us 
        JOIN "skill" s ON us.skill_id = s.id 
        WHERE us.username = $1 AND us.visible = true AND s.type = 'hard'
      ) as has_hard_skills;
  `;
  const result = await processReturnQuery(query, [username]);
  return result[0];
}