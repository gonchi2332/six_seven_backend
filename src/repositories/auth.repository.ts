import { PoolClient } from "pg";
import { processReturnQuery, processTransaction } from "../utils/query.util";
import * as TokenTypes from "../types/token.types";

/**
 * Busca un rol por su nombre en la tabla "role".
 * @param {string} name - Nombre del rol (ej. 'user', 'admin').
 * @returns Promesa con el resultado de la consulta (ID del rol).
 */
export async function findRoleByName(name: string) {
  const roleQuery = `
    SELECT id FROM "role"
    WHERE name = $1
  `;
  return await processReturnQuery(roleQuery, [name]);
}

/**
 * Crea un nuevo usuario en la base de datos dentro de una transacción.
 * Inserta en "user", "user_profile_picture" y opcionalmente en "user_second_surname".
 * @param {string} username - Nombre de usuario único.
 * @param {string} hashedPassword - Contraseña ya hasheada.
 * @param {number} roleId - ID del rol asignado.
 * @param {string} names - Nombres del usuario.
 * @param {string} firstSurname - Primer apellido.
 * @param {string} mainRegistrationEmail - Correo electrónico principal.
 * @param {string} [secondSurname] - Segundo apellido (opcional).
 * @returns Promesa con el resultado de la transacción conteniendo los datos del nuevo usuario.
 */
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

/**
 * Busca los valores básicos de un usuario para autenticación (password, estado, perfil).
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con los datos del usuario (username, hashed_password, state, names, first_surname, profile_picture).
 */
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

/**
 * Inserta un nuevo refresh token para un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} refresh_token - Token de refresco generado.
 * @param {Date} expiresAt - Fecha de expiración del token.
 */
export async function insertRefreshToken(username: string, refresh_token: string, expiresAt: Date) {
  const insertRefreshTokenQuery = `
    INSERT INTO refresh_token (username, token, expires_at)
    VALUES ($1, $2, $3);
  `;
  await processReturnQuery(insertRefreshTokenQuery, [username, refresh_token, expiresAt]);
}

/**
 * Busca un código de restablecimiento de contraseña válido (no expirado) para un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} verificationCode - Código de verificación.
 * @returns Promesa con el password actual del usuario si el código es válido.
 */
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

/**
 * Actualiza la contraseña del usuario y elimina todos sus códigos de restablecimiento activos en una transacción.
 * @param {string} username - Nombre de usuario.
 * @param {string} newHashedPassword - Nueva contraseña ya hasheada.
 */
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

/**
 * Inserta o actualiza un código de restablecimiento de contraseña para un usuario.
 * El código tiene una validez de 1 hora.
 * @param {string} username - Nombre de usuario.
 * @param {string} resetCode - Código de restablecimiento generado.
 */
export async function insertOrUpdateResetCode(username: string, resetCode: string) {
  const upsertCodeQuery = `
    INSERT INTO "password_reset_code" ("username", "code", "expires_at")
    VALUES ($1, $2, NOW() + INTERVAL '1 hour')
    ON CONFLICT ("username") DO UPDATE 
    SET "code" = EXCLUDED.code, "expires_at" = EXCLUDED.expires_at;
  `;
  return await processReturnQuery(upsertCodeQuery, [username, resetCode]);
}

/**
 * Obtiene el correo electrónico principal de registro de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con el `main_registration_email`.
 */
export async function findRegistrationEmail(username: string) {
  const emailQuery = `
    SELECT main_registration_email FROM "user"
    WHERE username = $1
  `;
  return await processReturnQuery(emailQuery, [username]);
}

/**
 * Obtiene el correo electrónico secundario de registro de un usuario si existe.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con el `registration_email` secundario.
 */
export async function findSecondaryEmail(username: string) {
  const secondaryEmailQuery = `
    SELECT registration_email FROM "user_registration_email"
    WHERE username = $1
  `;
  return await processReturnQuery(secondaryEmailQuery, [username]);
}

/**
 * Busca un código de restablecimiento activo para un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} code - Código a verificar.
 * @returns Promesa con el nombre de usuario si el código es válido y no ha expirado.
 */
export async function findResetCode(username: string, code: string) {
  const codeQuery = `
    SELECT username FROM "password_reset_code" 
    WHERE username = $1 AND code = $2 AND expires_at > NOW()
  `;
  return await processReturnQuery(codeQuery, [username, code]);
}

/**
 * Busca un refresh token válido en la base de datos.
 * @param {string} refreshToken - Token de refresco a buscar.
 * @returns Promesa con el nombre de usuario asociado al token si es válido.
 */
export async function findRefreshToken(refreshToken: string) {
  const findTokenQuery = `
    SELECT username 
    FROM refresh_token 
    WHERE token = $1 AND expires_at > NOW();
  `;
  return await processReturnQuery(findTokenQuery, [refreshToken]);
}

/**
 * Obtiene el estado de verificación de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con el `state` del usuario.
 */
export async function findUserStateByUserame(username: string) {
  const findUserQuery = `
    SELECT state
    FROM "user"
    WHERE username = $1   
  `;
  return await processReturnQuery(findUserQuery, [username]);
}

/**
 * Elimina un refresh token de la base de datos (logout).
 * @param {string} refreshToken - Token a eliminar.
 * @returns Promesa con el token eliminado si existía.
 */
export async function deleteRefreshToken(refreshToken: string) {
  const deleteTokenQuery = `
    DELETE FROM refresh_token
    WHERE token = $1
    RETURNING token
  `;
  return await processReturnQuery(deleteTokenQuery, [refreshToken]);
}