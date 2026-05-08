import { processReturnQuery } from "../utils/query";
import * as SkillTypes from "../types/skill.types";

export async function getAllUserSkills(username: string, skillType: SkillTypes.SkillType) {
  let skillQuery;
  if (skillType === "hard") {
    skillQuery = `
      SELECT s.name, us.punctuation FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = $2
    `;
  } else {
    skillQuery = `
      SELECT s.name FROM "user_skill" us
      JOIN "skill" s ON us.skill_id = s.id
      WHERE us.username = $1 AND s.type = $2
    `;
  }
  const userSkills = await processReturnQuery(skillQuery, [username, skillType]);
  return userSkills;
}

export async function getUserSkill(username: string, skillName: string, skillType: SkillTypes.SkillType) {
  const checkQuery = `
     SELECT * FROM "user_skill" us
     JOIN "skill" s ON us.skill_id = s.id
     WHERE us.username = $1 AND s.name = $2 AND s.type = $3
  `;
  const values = [username, skillName, skillType];
  const foundUserSkill = await processReturnQuery(checkQuery, values);
  return foundUserSkill;
}

export async function getSkill(skillName: string, skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT id FROM "skill" 
    WHERE type = $1 AND canon_name = $2
  `;
  const values = [skillType, skillName.toLowerCase()];
  const foundSkill = await processReturnQuery(selectQuery, values);
  return foundSkill;
}

export async function getAllSkillsCanonName(skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT canon_name FROM "skill"
    WHERE type = $1
  `;
  const skills = await processReturnQuery(selectQuery, [skillType]);
  return skills;
}

export async function getAllSkills(skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT name FROM "skill"
    WHERE type = $1
  `;
  const skills = await processReturnQuery(selectQuery, [skillType]);
  return skills;
}

export async function getAllUserLaboralExperiences(username: string) {
  const selectQuery = `
    SELECT id, position, company_name, description, visible, start_date, end_date FROM "laboral_experience"
    WHERE username = $1
  `;
  const userLaboralExperiences = await processReturnQuery(selectQuery, [username]);
  return userLaboralExperiences;
}

export async function getLaboralExperience(username: string, id: number) {
  const selectQuery = `
    SELECT position, company_name, description, visible, start_date, end_date FROM "laboral_experience"
    WHERE id = $1 AND username = $2
  `;
  const foundLaboralExperience = await processReturnQuery(selectQuery, [id, username]);
  return foundLaboralExperience;
}

export async function getEducation(id: number) {
  const selectQuery = `
    SELECT a.name AS title, a.institution, d.name AS academicDegree,
    a.visible, a.start_date, a.end_date 
    FROM "academic_training" a
    LEFT JOIN "academic_degree" d ON d.id = a.academic_degree_id
    WHERE a.id = $1 AND a.visible
  `;
  const foundEducation = await processReturnQuery(selectQuery, [id]);
  return foundEducation;
}

export async function getAllPublicUserEducation(username: string) {
  const selectQuery = `
    SELECT a.id, a.name AS title, a.institution, d.name AS academicDegree,
    a.visible, a.start_date, a.end_date 
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
    a.visible, a.start_date, a.end_date 
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

export async function getProjectByIdAndUser(username: string, projectId: number) {
  const selectQuery = `
    SELECT id FROM "project" 
    WHERE id = $1 AND username = $2
  `;
  const foundProject = await processReturnQuery(selectQuery, [projectId, username]);
  return foundProject;
}

export async function getPublicProjects(username: string) {
  const query = `
    SELECT 
      p.id, p.name, p.description, p.topic, p.status, p.role, p.image,
      COALESCE(json_agg(json_build_object('label', l.label, 'url', l.link)) FILTER (WHERE l.link IS NOT NULL), '[]') as links
    FROM "project" p
    LEFT JOIN "project_link" pl ON p.id = pl.project_id
    LEFT JOIN "link" l ON pl.link_id = l.id
    WHERE p.username = $1 AND p.visible = TRUE
    GROUP BY p.id
    ORDER BY p.id DESC
  `;
  const projectsFromDB = await processReturnQuery(query, [username]);
  const formattedProjects = projectsFromDB.map(proj => {
    let base64Image = null;
    if (proj.image) {
      base64Image = `data:image/jpeg;base64,${proj.image.toString("base64")}`;
    }
    return {
      id: proj.id,
      name: proj.name,
      description: proj.description,
      topic: proj.topic,
      status: proj.status,
      role: proj.role,
      links: proj.links,
      image: base64Image
    };
  });
  return formattedProjects;
}
