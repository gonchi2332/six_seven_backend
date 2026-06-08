import { processReturnQuery } from "../utils/query.util";

export async function getProfileLink(username: string) {
  const querySelect = `
    SELECT public_profile_link FROM "user"
    WHERE username = $1
  `;
  return await processReturnQuery(querySelect, [username]);
}

export async function updateProfileLink(publicLink: string, username: string) {
  const queryUpdate = `
    UPDATE "user"
    SET public_profile_link = $1
    WHERE username = $2
  `;
  const values = [publicLink, username];
  return await processReturnQuery(queryUpdate, values);
}

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