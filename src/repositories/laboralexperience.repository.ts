import { processReturnQuery } from "../utils/query.util";
import * as LaboralExpTypes from "../types/laboralexperience.types";

/**
 * Verifica si un registro de experiencia laboral ya existe para un usuario.
 * Compara el puesto, la empresa y la fecha de inicio.
 * @param {LaboralExpTypes.LaboralExperienceInfo} laboralExperienceInfo - Datos de la experiencia laboral.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa que resuelve a `true` si el registro existe, `false` en caso contrario.
 */
export async function laboralExperienceExists(
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo,
  username: string,) {
  const {
    position,
    companyName,
    startDate,
  } = laboralExperienceInfo;

  const checkQuery = `
    SELECT id FROM "laboral_experience"
    WHERE position = $1 AND company_name = $2 AND start_date = $3 AND username = $4
  `;
  const values = [position, companyName, startDate, username];
  const foundLaboralExperience = await processReturnQuery(checkQuery, values);
  return !(foundLaboralExperience.length === 0);
}

/**
 * Obtiene un registro de experiencia laboral por su ID y nombre de usuario.
 * @param {string} username - Nombre de usuario.
 * @param {number} id - ID del registro de experiencia laboral.
 * @returns Promesa con los datos del registro (puesto, empresa, descripción, visibilidad, fechas).
 */
export async function getLaboralExperience(username: string, id: number) {
  const selectQuery = `
    SELECT position, company_name, description, visible, start_date, end_date FROM "laboral_experience"
    WHERE id = $1 AND username = $2
  `;
  const foundLaboralExperience = await processReturnQuery(selectQuery, [id, username]);
  return foundLaboralExperience;
}

/**
 * Crea un nuevo registro de experiencia laboral para un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {LaboralExpTypes.LaboralExperienceInfo} laboralExperienceInfo - Datos de la experiencia laboral.
 */
export async function createLaboralExperience(username: string, laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo) {
  const insertQuery = `
    INSERT INTO "laboral_experience" (position, company_name, description, visible, start_date, 
      end_date, username)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const {
    position,
    companyName,
    description,
    startDate,
    endDate = null
  } = laboralExperienceInfo;
  const values = [position, companyName, description, true, startDate, endDate, username];
  await processReturnQuery(insertQuery, values);
}

/**
 * Actualiza un registro de experiencia laboral existente de forma dinámica.
 * Solo actualiza los campos proporcionados en `laboralExperienceInfo`.
 * @param {string} username - Nombre de usuario.
 * @param {LaboralExpTypes.LaboralExperienceInfo} laboralExperienceInfo - Datos actualizados.
 * @param {number} id - ID del registro a actualizar.
 */
export async function updateUserLaboralExperience(
  username: string,
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo,
  id: number) {
  const {
    position,
    companyName,
    description,
    startDate,
    endDate = null
  } = laboralExperienceInfo;

  let updateQuery;
  if (position) {
    updateQuery = `
      UPDATE "laboral_experience"
      SET position = $1
      WHERE id = $2 AND username = $3
    `;
    await processReturnQuery(updateQuery, [position, id, username]);
  }
  if (companyName) {
    updateQuery = `
      UPDATE "laboral_experience"
      SET company_name = $1
      WHERE id = $2 AND username = $3
    `;
    await processReturnQuery(updateQuery, [companyName, id, username]);
  }
  if (description) {
    updateQuery = `
      UPDATE "laboral_experience"
      SET description = $1
      WHERE id = $2 AND username = $3
    `;
    await processReturnQuery(updateQuery, [description, id, username]);
  }
  if (startDate) {
    updateQuery = `
      UPDATE "laboral_experience"
      SET start_date = $1
      WHERE id = $2 AND username = $3
    `;
    await processReturnQuery(updateQuery, [startDate, id, username]);
  }
  if (endDate || endDate === "") {
    updateQuery = `
      UPDATE "laboral_experience"
      SET end_date = $1
      WHERE id = $2 AND username = $3
    `;
    let values;
    if (endDate === "") {
      values = [null, id, username];
      await processReturnQuery(updateQuery, values);
    } else {
      values = [endDate, id, username];
      await processReturnQuery(updateQuery, values);
    }
  }
}

/**
 * Obtiene todos los registros de experiencia laboral públicos de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con la lista de registros públicos.
 */
export async function getAllPublicUserLaboralExperiences(username: string) {
  const selectQuery = `
    SELECT id, position, company_name, description, visible, start_date, end_date 
    FROM "laboral_experience"
    WHERE username = $1 AND visible = true
  `;
  const userLaboralExperiences = await processReturnQuery(selectQuery, [username]);
  return userLaboralExperiences;
}

/**
 * Obtiene todos los registros de experiencia laboral (públicos y privados) de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con la lista completa de registros.
 */
export async function getAllUserLaboralExperiences(username: string) {
  const selectQuery = `
    SELECT id, position, company_name, description, visible, start_date, end_date FROM "laboral_experience"
    WHERE username = $1
  `;
  const userLaboralExperiences = await processReturnQuery(selectQuery, [username]);
  return userLaboralExperiences;
}

/**
 * Actualiza la visibilidad de múltiples registros de experiencia laboral de forma masiva.
 * @param {string} username - Nombre de usuario.
 * @param {Record<string, boolean>} visibilities - Mapa de IDs y estados de visibilidad.
 */
export async function updateLaboralExperiencesVisibilityBulk(username: string, visibilities: Record<string, boolean>) {
  const updates = Object.entries(visibilities).map(([id, visible]) => {
    const idNum = parseInt(id, 10);
    const isVisible = Boolean(visible); 
    return processReturnQuery(
      "UPDATE \"laboral_experience\" SET visible = $1 WHERE id = $2 AND username = $3",
      [isVisible, idNum, username]
    );
  });
  await Promise.all(updates);
}

/**
 * Elimina un registro de experiencia laboral por su ID y nombre de usuario.
 * @param {string} username - Nombre de usuario.
 * @param {number} id - ID del registro a eliminar.
 * @returns Promesa con el puesto del registro eliminado.
 */
export async function deleteLaboralExperience(username: string, id: number) {
  const deleteQuery = `
    DELETE FROM "laboral_experience"
    WHERE id = $1 AND username = $2
    RETURNING position
  `;
  const deletedLaboralExperience = await processReturnQuery(deleteQuery, [id, username]);
  return deletedLaboralExperience;
}
