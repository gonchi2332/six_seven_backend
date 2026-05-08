import { PoolClient } from "pg";
import { processTransaction, processReturnQuery } from "../utils/query";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as educacionTypes from "../types/education.types";
import * as ProjectTypes from "../types/project.types";

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
  if (endDate) {
    updateQuery = `
      UPDATE "laboral_experience"
      SET end_date = $1
      WHERE id = $2 AND username = $3
    `;
    await processReturnQuery(updateQuery, [endDate, id, username]);
  }
}

export async function updateEducation(
  educacionInfo: educacionTypes.EducationInfo,
  id: number
) {
  const { title, institution, academyDegreeId, startDate, endDate = null } = educacionInfo;

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
  if (endDate) {
    setParts.push(`end_date = $${placeholderIndex++}`);
    values.push(endDate);
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
    for (const linkStr of links) {
      const linkRes = await client.query("INSERT INTO \"link\" (link) VALUES ($1) RETURNING id", [linkStr]);
      const linkId = linkRes.rows[0].id;
      await client.query("INSERT INTO \"project_link\" (project_id, link_id) VALUES ($1, $2)", [projectId, linkId]);
    }
  });
}
