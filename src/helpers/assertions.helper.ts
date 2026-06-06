import { processReturnQuery } from "../utils/query";
import { formatAcademicInfo } from "./education.helper";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as ProjectTypes from "../types/project.types";
import * as EducationTypes from "../types/education.types";
import * as CertificateTypes from "../types/certificate.types";

export async function userExists(username: string) {
  const checkQuery = `
    SELECT username FROM "user"
    WHERE username = $1
  `;
  const foundUsers = await processReturnQuery(checkQuery, [username]);
  return !(foundUsers.length === 0);
}

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

export async function projectExists(projectInfo: ProjectTypes.ProjectInfo, username: string) {
  const { name } = projectInfo;
  
  const checkQuery = `
    SELECT id FROM "project"
    WHERE name = $1 AND username = $2
  `;
  const values = [name, username];
  const foundProjects = await processReturnQuery(checkQuery, values);
  return !(foundProjects.length === 0);
}

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

export async function certificateExists(
  certificateInfo: CertificateTypes.CertificateInfo,
  username: string) {
  const { title, area } = certificateInfo;

  const checkQuery = `
    SELECT id FROM "certificate"
    WHERE title = $1 AND area = $2 AND username = $3
  `;
  const values = [title, area, username];
  const foundCertificates = await processReturnQuery(checkQuery, values);
  return !(foundCertificates.length === 0);
}