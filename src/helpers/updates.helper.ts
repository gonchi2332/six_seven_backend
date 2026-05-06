import { processReturnQuery } from "../utils/query";
import * as LaboralExpTypes from "../types/laboralexperience.types";

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