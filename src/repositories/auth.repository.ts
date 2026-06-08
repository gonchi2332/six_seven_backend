import { PoolClient } from "pg";
import { processReturnQuery, processTransaction } from "../utils/query.util";
import * as TokenTypes from "../types/token.types";

export async function findRoleByName(name: string) {
  const roleQuery = `
    SELECT id FROM "role"
    WHERE name = $1
  `;
  return await processReturnQuery(roleQuery, [name]);
}

export async function createUser(
  username: string,
  hashedPassword: string,
  roleId: number,
  names: string,
  firstSurname: string,
  mainRegistrationEmail: string,
  secondSurname?: string) {
  return await processTransaction<TokenTypes.RegistrationResult>(async function (client: PoolClient) {
    let userQuery = `
      INSERT INTO "user" (username, password, state, role_id, names, first_surname, main_registration_email)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, state, names, first_surname, main_registration_email
    `;
    const userValues = [
      username,
      hashedPassword,
      TokenTypes.VerificationState.UNVERIFIED,
      roleId,
      names,
      firstSurname,
      mainRegistrationEmail
    ];
    const userRes = await client.query(userQuery, userValues);
    const newUser = userRes.rows[0];
    userQuery = `
      INSERT INTO "user_profile_picture" (username, profile_picture_id)
      VALUES ($1, 1);
    `;
    await client.query(userQuery, [username]);
  
    if (secondSurname && secondSurname.trim() !== "") {
      const surnameQuery = `
        INSERT INTO "user_second_surname" (username, second_surname)
        VALUES ($1, $2);
      `;
      await client.query(surnameQuery, [username, secondSurname.trim()]);
    }

    return { user: newUser };
  });
}

export async function findUserValues(username: string) {
  const findUserQuery = `
    SELECT 
      u.username, u.password as hashed_password, u.state,
      u.names, u.first_surname, pp.profile_picture
    FROM "user" u
    LEFT JOIN "user_profile_picture" upp ON u.username = upp.username
    LEFT JOIN "profile_picture" pp ON upp.profile_picture_id = pp.id
    WHERE u.username = $1   
  `;
  const values = [username];
  return await processReturnQuery(findUserQuery, values);
}

export async function insertRefreshToken(username: string, refresh_token: string, expiresAt: Date) {
  const insertRefreshTokenQuery = `
    INSERT INTO refresh_token (username, token, expires_at)
    VALUES ($1, $2, $3);
  `;
  await processReturnQuery(insertRefreshTokenQuery, [username, refresh_token, expiresAt]);
}

export async function findValidResetCode(username: string, verificationCode: string) {
  const findCodeQuery = `
    SELECT u.password as hashed_password
    FROM "user" u
    JOIN "password_reset_code" p ON u.username = p.username
    WHERE u.username = $1
    AND p.code = $2 
    AND p.expires_at > NOW()
  `;
  return await processReturnQuery(findCodeQuery, [username, verificationCode]);
}

export async function updatePasswordAndDeleteCode(username: string, newHashedPassword: string) {
  return await processTransaction(async function (client) {
    const updateQuery = `
      UPDATE "user"
      SET password = $1 WHERE username = $2
    `;
    const values = [newHashedPassword, username];
    await client.query(updateQuery, values);

    const deleteQuery = `
      DELETE FROM "password_reset_code"
      WHERE username = $1
    `; 
    await client.query(deleteQuery, [username]);
  });
}

export async function insertOrUpdateResetCode(username: string, resetCode: string) {
  const upsertCodeQuery = `
    INSERT INTO "password_reset_code" ("username", "code", "expires_at")
    VALUES ($1, $2, NOW() + INTERVAL '1 hour')
    ON CONFLICT ("username") DO UPDATE 
    SET "code" = EXCLUDED.code, "expires_at" = EXCLUDED.expires_at;
  `;
  return await processReturnQuery(upsertCodeQuery, [username, resetCode]);
}

export async function findRegistrationEmail(username: string) {
  const emailQuery = `
    SELECT main_registration_email FROM "user"
    WHERE username = $1
  `;
  return await processReturnQuery(emailQuery, [username]);
}

export async function findSecondaryEmail(username: string) {
  const secondaryEmailQuery = `
    SELECT registration_email FROM "user_registration_email"
    WHERE username = $1
  `;
  return await processReturnQuery(secondaryEmailQuery, [username]);
}

export async function findResetCode(username: string, code: string) {
  const codeQuery = `
    SELECT username FROM "password_reset_code" 
    WHERE username = $1 AND code = $2 AND expires_at > NOW()
  `;
  return await processReturnQuery(codeQuery, [username, code]);
}

export async function findRefreshToken(refreshToken: string) {
  const findTokenQuery = `
    SELECT username 
    FROM refresh_token 
    WHERE token = $1 AND expires_at > NOW();
  `;
  return await processReturnQuery(findTokenQuery, [refreshToken]);
}

export async function findUserStateByUserame(username: string) {
  const findUserQuery = `
    SELECT state
    FROM "user"
    WHERE username = $1   
  `;
  return await processReturnQuery(findUserQuery, [username]);
}

export async function deleteRefreshToken(refreshToken: string) {
  const deleteTokenQuery = `
    DELETE FROM refresh_token
    WHERE token = $1;
  `;
  return await processReturnQuery(deleteTokenQuery, [refreshToken]);
}