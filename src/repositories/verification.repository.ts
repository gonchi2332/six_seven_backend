import { processReturnQuery } from "../utils/query.util";
import * as TokenTypes from "../types/token.types";

export async function getUserRegistrationEmail(username: string) {
  const emailQuery = `
    SELECT main_registration_email FROM "user"
    WHERE username = $1
  `;
  const emailRes = await processReturnQuery(emailQuery, [username]);
  return emailRes[0];
}

export async function getCurrentVerificationMailCode(username: string) {
  const checkQuery = `
    SELECT * FROM "verification_mail_code"
    WHERE username = $1 AND expires_at > now()
  `;
  return await processReturnQuery(checkQuery, [username]);
}

export async function insertVerificationMailCode(username: string, code: string) {
  const insertQuery = `
    INSERT INTO "verification_mail_code" (username, code)
    VALUES ($1, $2)
  `;
  const values = [username, code];
  return await processReturnQuery(insertQuery, values);
}

export async function forceExpirationCode(username: string, currentCode: string) {
  const insertQuery = `
    UPDATE "verification_mail_code"
    SET expires_at = now() - interval '1 hour'
    WHERE username = $1 AND code = $2
  `;
  const values = [username, currentCode];
  return await processReturnQuery(insertQuery, values);
}

export async function getUserSecondaryEmail(username: string) {
  const secondaryEmailQuery = `
    SELECT registration_email FROM "user_registration_email"
    WHERE username = $1
  `;
  const secondaryRegistrationEmail = await processReturnQuery(secondaryEmailQuery, [username]);
  return secondaryRegistrationEmail[0];
}

export async function updateVerificationCode(username: string) {
  const updateQuery = `
    UPDATE "user"
    SET state = $1
    WHERE username = $2
  `;
  const values = [TokenTypes.VerificationState.VERIFIED, username];
  return await processReturnQuery(updateQuery, values);
}