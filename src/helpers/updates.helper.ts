import { PoolClient } from "pg";
import { processTransaction, processReturnQuery } from "../utils/query";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as educacionTypes from "../types/education.types";
import * as ProjectTypes from "../types/project.types";
import * as CertificateTypes from "../types/certificate.types";

export async function updateUserHardSkill(newPunctuation: number, username: string, skillName: string) {
  const updateQuery = `
    UPDATE "user_skill" us
    SET punctuation = $1
    FROM "skill" s
    WHERE us.skill_id = s.id AND us.username = $2 AND s.name = $3
  `;
  const queryValues = [newPunctuation, username, skillName];
  await processReturnQuery(updateQuery, queryValues);
}

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

export async function updateEducation(
  educacionInfo: educacionTypes.EducationInfo,
  id: number
) {
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


export async function updatePersonalProject(username: string, projectId: number, projectInfo: ProjectTypes.ProjectInfo) {
  const { description, topic, status, role, imageBuffer, links } = projectInfo;

  await processTransaction(async (client: PoolClient) => {
    if (imageBuffer) {
      const query = `
        UPDATE "project"
        SET description = $1, topic = $2, status = $3, role = $4, image = $5
        WHERE id = $6 AND username = $7
      `;
      await client.query(query, [description, topic, status, role, imageBuffer, projectId, username]);
    } else {
      const query = `
        UPDATE "project"
        SET description = $1, topic = $2, status = $3, role = $4
        WHERE id = $5 AND username = $6
      `;
      await client.query(query, [description, topic, status, role, projectId, username]);
    }
    const oldLinksQuery = "SELECT link_id FROM \"project_link\" WHERE project_id = $1";
    const oldLinksRes = await client.query(oldLinksQuery, [projectId]);
    const oldLinkIds = oldLinksRes.rows.map(r => r.link_id);
    if (oldLinkIds.length > 0) {
      await client.query("DELETE FROM \"project_link\" WHERE project_id = $1", [projectId]);
      await client.query("DELETE FROM \"link\" WHERE id = ANY($1::int[])", [oldLinkIds]);
    }
    for (const item of links) {
      const linkRes = await client.query("INSERT INTO \"link\" (label, link) VALUES ($1, $2) RETURNING id", [item.label, item.url]);
      const linkId = linkRes.rows[0].id;
      await client.query("INSERT INTO \"project_link\" (project_id, link_id) VALUES ($1, $2)", [projectId, linkId]);
    }
  });
}

export async function updateCertificate(
  username: string,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File,
  id: number) {
  const { description, area, issueDate } = certificateInfo;

  const setParts: string[] = [];
  const values: unknown[] = [];
  let placeholderIndex = 1;
  if (description) {
    setParts.push(`description = $${placeholderIndex++}`);
    values.push(description);
  }
  if (area) {
    setParts.push(`area = $${placeholderIndex++}`);
    values.push(area);
  }
  if (coverImage) {
    setParts.push(`file = $${placeholderIndex++}`);
    values.push(coverImage);
  }
  if (issueDate) {
    setParts.push(`issue_date = $${placeholderIndex++}`);
    values.push(issueDate);
  }
  setParts.push(`username = $${placeholderIndex++}`);
  values.push(username);
  setParts.push(`visible = $${placeholderIndex++}`);
  values.push(true);

  values.push(id);
  const whereQuery = `WHERE id = $${placeholderIndex}`;
  const updateQuery = `UPDATE "certificate" 
                       SET ${setParts.join(", ")}
                       ${whereQuery}`;
  await processReturnQuery(updateQuery, values);
}

// El bulk siginifica que es una actualización en lotes, por si las moscas jsjs
export async function updateProjectsVisibilityBulk(username: string, visibilities: Record<string, boolean>) {
  const queries = Object.entries(visibilities).map(([id, isVisible]) => {
    const query = `
      UPDATE "project" 
      SET visible = $1 
      WHERE id = $2 AND username = $3
    `;
    const values = [isVisible, parseInt(id, 10), username];
    return processReturnQuery(query, values);
  });
  await Promise.all(queries);
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

export async function updateCertificatesVisibilityBulk(username: string, visibilities: Record<string, boolean>) {
  const queries = Object.entries(visibilities).map(([id, isVisible]) => {
    const query = `
      UPDATE "certificate" 
      SET visible = $1 
      WHERE id = $2 AND username = $3
    `;
    const values = [isVisible, parseInt(id, 10), username];
    
    return processReturnQuery(query, values); 
  });
  await Promise.all(queries);
}

export async function updateSkillsVisibilityBulk(username: string, visibilities: Record<string, boolean>) {
  const queries = Object.entries(visibilities).map(([skillId, isVisible]) => {
    const query = `
      UPDATE "user_skill" 
      SET visible = $1 
      WHERE skill_id = $2 AND username = $3
    `;
    const values = [isVisible, parseInt(skillId, 10), username];
    return processReturnQuery(query, values); 
  });
  await Promise.all(queries);
}
