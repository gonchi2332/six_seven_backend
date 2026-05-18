import { processTransaction, processReturnQuery } from "../utils/query";
import { PoolClient } from "pg";
import { formatAcademicInfo } from "./education.helper";
import * as SkillTypes from "../types/skill.types";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as ProjectTypes from "../types/project.types";
import * as EducacionTypes from "../types/education.types";
import * as CertificateTypes from "../types/certificate.types";

export async function createSkill(skillName: string, canonSkillName: string, skillType: SkillTypes.SkillType) {
  const insertQuery = `
    INSERT INTO "skill" (name, type, canon_name)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const values = [skillName, skillType, canonSkillName];
  const createdSkill = await processReturnQuery(insertQuery, values);
  return createdSkill; 
}

export async function createUserSkill(skillId: string, username: string, punctuation?: number) {
  let insertQuery, values;
  if(!punctuation) {
    insertQuery = `
      INSERT INTO "user_skill" (skill_id, username) 
      VALUES ($1, $2)
    `;
    values = [skillId, username];
  } else {
    insertQuery = `
      INSERT INTO "user_skill" (skill_id, username, punctuation)
      VALUES ($1, $2, $3)
    `;
    values = [skillId, username, punctuation];
  }
  await processReturnQuery(insertQuery, values);
}

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

export async function createEducation(username: string, educacionInfo: EducacionTypes.EducationInfo) {
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

export async function createPersonalProject(username: string, projectInfo: ProjectTypes.ProjectInfo) {
  const { name, description, topic, status, role, imageBuffer, links } = projectInfo;

  await processTransaction(async (client: PoolClient) => {
    const projectQuery = `
      INSERT INTO "project" (name, description, topic, status, role, image, username, visible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const projectValues = [name, description, topic, status, role, imageBuffer, username, true];
    const projectRes = await client.query(projectQuery, projectValues);
    const projectId = projectRes.rows[0].id;

    for (const item of links) {
      const linkQuery = "INSERT INTO \"link\" (label, link) VALUES ($1, $2) RETURNING id";
      const linkRes = await client.query(linkQuery, [item.label, item.url]);
      const linkId = linkRes.rows[0].id;

      const projectLinkQuery = "INSERT INTO \"project_link\" (project_id, link_id) VALUES ($1, $2)";
      await client.query(projectLinkQuery, [projectId, linkId]);
    }
  });
}

export async function createCertificate(
  username: string,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImageBuffer: Express.Multer.File ) {
  const { title, description, area, issueDate } = certificateInfo;
  
  const insertQuery = `
    INSERT INTO "certificate" (title, description, area, issue_date, file, username, visible)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [title, description, area, issueDate, coverImageBuffer.buffer, username, true];
  await processReturnQuery(insertQuery, values);
}