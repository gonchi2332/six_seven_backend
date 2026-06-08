import { processReturnQuery } from "../utils/query.util";
import { formatAcademicInfo } from "../helpers/education.helper";
import * as EducationTypes from "../types/education.types";

/**
 * Verifica si un registro de formación académica ya existe para un usuario.
 * Compara el título y la institución (normalizados) asociados al usuario.
 * @param {EducationTypes.EducationInfo} educationInfo - Datos de la educación (título, institución).
 * @param {string} username - Nombre de usuario.
 * @param {"register" | "modify"} action - Acción que se está realizando (para decidir si normalizar).
 * @returns Promesa que resuelve a `true` si el registro existe, `false` en caso contrario.
 */
export async function educationExists(
  educationInfo: EducationTypes.EducationInfo,
  username: string,
  action: "register" | "modify") {
  const { title, institution } = educationInfo;

  const formatedTitle = (action === "register") ? await formatAcademicInfo(title) : title;
  const formatedInstitution = (action === "register") ? await formatAcademicInfo(institution) : institution;

  const checkQuery = `
    SELECT id FROM "academic_training"
    WHERE canon_title = $1 AND canon_institution = $2 AND username = $3
  `;
  const values = [formatedTitle, formatedInstitution, username];
  const foundEducations = await processReturnQuery(checkQuery, values);
  return !(foundEducations.length === 0);
}

/**
 * Obtiene un registro de formación académica por su ID si es visible.
 * @param {number} id - ID del registro de educación.
 * @returns Promesa con los datos del registro (título, institución, grado, visibilidad, fecha inicio, estado).
 */
export async function getEducation(id: number) {
  const selectQuery = `
    SELECT a.name AS title, a.institution, d.name AS academicDegree,
    a.visible, a.start_date, a.education_state
    FROM "academic_training" a
    LEFT JOIN "academic_degree" d ON d.id = a.academic_degree_id
    WHERE a.id = $1 AND a.visible
  `;
  const foundEducation = await processReturnQuery(selectQuery, [id]);
  return foundEducation;
}

/**
 * Crea un nuevo registro de formación académica para un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {EducationTypes.EducationInfo} educacionInfo - Datos del registro a crear.
 */
export async function createEducation(username: string, educacionInfo: EducationTypes.EducationInfo) {
  const insertQuery = `
    INSERT INTO "academic_training" (name, academic_degree_id, institution, visible, start_date, 
      username, canon_title, canon_institution, education_state)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
  const {
    title,
    institution,
    academyDegreeId,
    startDate,
    educationState
  } = educacionInfo;
  const formatedTitle = await formatAcademicInfo(title);
  const formatedInstitution = await formatAcademicInfo(institution);
  const values = [title, academyDegreeId, institution, true, startDate, username, formatedTitle,
    formatedInstitution, educationState];
  await processReturnQuery(insertQuery, values);
}

/**
 * Actualiza un registro de formación académica existente de forma dinámica.
 * Solo actualiza los campos proporcionados en `educacionInfo`.
 * @param {EducationTypes.EducationInfo} educacionInfo - Datos actualizados.
 * @param {number} id - ID del registro a actualizar.
 */
export async function updateEducation(
  educacionInfo: EducationTypes.EducationInfo,
  id: number) {
  const { title, institution, academyDegreeId, startDate, educationState } = educacionInfo;

  const setParts: string[] = [];
  const values: unknown[] = [];
  let placeholderIndex = 1;

  if (title) {
    setParts.push(`name = $${placeholderIndex++}`);
    values.push(title);
  }
  if (institution) {
    setParts.push(`institution = $${placeholderIndex++}`);
    values.push(institution);
  }
  if (academyDegreeId) {
    setParts.push(`academic_degree_id = $${placeholderIndex++}`);
    values.push(academyDegreeId);
  }
  if (startDate) {
    setParts.push(`start_date = $${placeholderIndex++}`);
    values.push(startDate);
  }
  if (educationState) {
    setParts.push(`education_state = $${placeholderIndex++}`);
    values.push(educationState);
  }
  if (setParts.length === 0) return;

  values.push(id);
  const whereQuery = `WHERE id = $${placeholderIndex}`;

  const updateQuery = `UPDATE "academic_training" 
                       SET ${setParts.join(", ")}
                       ${whereQuery}`;

  await processReturnQuery(updateQuery, values);
}

/**
 * Elimina un registro de formación académica por su ID.
 * @param {number} educationId - ID del registro a eliminar.
 * @returns Promesa con el nombre del registro eliminado.
 */
export async function deleteEducation(educationId: number) {
  const deleteQuery = `
    DELETE FROM "academic_training"
    WHERE id = $1
    RETURNING name
  `;
  const deletedEducation = await processReturnQuery(deleteQuery, [educationId]);
  return deletedEducation;
}

/**
 * Obtiene todos los registros de formación académica públicos de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con la lista de registros públicos.
 */
export async function getAllPublicUserEducation(username: string) {
  const selectQuery = `
    SELECT a.id, a.name AS title, a.institution, d.name AS academicDegree,
    a.visible, a.start_date, a.education_state
    FROM "academic_training" a
    LEFT JOIN "academic_degree" d ON d.id = a.academic_degree_id
    WHERE username = $1 AND a.visible
  `;
  const foundPublicUserEducation = await processReturnQuery(selectQuery, [username]);
  return foundPublicUserEducation;
}

/**
 * Obtiene todos los registros de formación académica (públicos y privados) de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con la lista completa de registros.
 */
export async function getAllUserEducation(username: string) {
  const selectQuery = `
    SELECT a.id, a.name AS title, a.institution, d.name AS academicDegree,
    a.visible, a.start_date, a.education_state
    FROM "academic_training" a
    LEFT JOIN "academic_degree" d ON d.id = a.academic_degree_id
    WHERE username = $1
  `;
  const foundUserEducations = await processReturnQuery(selectQuery, [username]);
  return foundUserEducations;
}

/**
 * Obtiene el catálogo de grados académicos disponibles.
 * @returns Promesa con la lista de grados académicos (id, name).
 */
export async function getAcademicDegrees() {
  const selectQuery = `
    SELECT id, name AS academicDegree
    FROM "academic_degree"
  `;
  const foundAcademicDegree = await processReturnQuery(selectQuery, []);
  return foundAcademicDegree;
}

/**
 * Actualiza la visibilidad de múltiples registros de educación de forma masiva.
 * @param {string} username - Nombre de usuario.
 * @param {Record<string, boolean>} visibilities - Mapa de IDs y estados de visibilidad.
 */
export async function updateEducationVisibilityBulk(username: string, visibilities: Record<string, boolean>) {
  const queries = Object.entries(visibilities).map(([id, isVisible]) => {
    const query = `
      UPDATE "academic_training" 
      SET visible = $1 
      WHERE id = $2 AND username = $3
    `;
    const values = [isVisible, parseInt(id, 10), username];
    return processReturnQuery(query, values);
  });
  await Promise.all(queries);
}