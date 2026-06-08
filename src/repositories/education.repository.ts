import { processReturnQuery } from "../utils/query.util";
import { formatAcademicInfo } from "../helpers/education.helper";
import * as EducationTypes from "../types/education.types";

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

export async function deleteEducation(educationId: number) {
  const deleteQuery = `
    DELETE FROM "academic_training"
    WHERE id = $1
    RETURNING name
  `;
  const deletedEducation = await processReturnQuery(deleteQuery, [educationId]);
  return deletedEducation;
}

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

export async function getAcademicDegrees() {
  const selectQuery = `
    SELECT id, name AS academicDegree
    FROM "academic_degree"
  `;
  const foundAcademicDegree = await processReturnQuery(selectQuery, []);
  return foundAcademicDegree;
}

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