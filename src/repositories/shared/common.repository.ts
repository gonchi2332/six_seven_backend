import { processReturnQuery } from "../../utils/query.util";

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} username - Nombre de usuario a buscar.
 * @returns Promesa con el nombre de usuario si existe.
 */
export async function findByUsername(username: string) {
  const checkQuery = `
    SELECT username FROM "user" 
    WHERE username = $1`;
  return await processReturnQuery(checkQuery, [username]);
}

/**
 * Verifica si un usuario existe en la base de datos.
 * @param {string} username - Nombre de usuario a verificar.
 * @returns Promesa que resuelve a `true` si el usuario existe, `false` en caso contrario.
 */
export async function userExists(username: string) {
  const checkQuery = `
    SELECT username FROM "user"
    WHERE username = $1
  `;
  const foundUsers = await processReturnQuery(checkQuery, [username]);
  return !(foundUsers.length === 0);
}

/**
 * Registra una vista de una interfaz específica por parte de un usuario.
 * @param {string} username - Nombre de usuario que realiza la vista.
 * @param {number} interfaceId - ID de la interfaz visitada.
 * @returns Promesa con el resultado de la inserción.
 */
export async function insertInterfaceView(username: string, interfaceId: number) {
  const query = `
    INSERT INTO "interface_view" (username, interface_id)
    VALUES ($1, $2);
  `;
  const result = await processReturnQuery(query, [username, interfaceId]);
  return result[0];
}