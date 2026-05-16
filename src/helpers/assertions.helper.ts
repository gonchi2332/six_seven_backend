import { processReturnQuery } from "../utils/query";
import * as LaboralExpTypes from "../types/laboralexperience.types";

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