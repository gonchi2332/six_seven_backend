import { processReturnQuery } from "../utils/query.util";
import * as TokenTypes from "../types/token.types";

/**
 * Obtiene el correo electrónico principal de registro de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con el `main_registration_email`.
 */
export async function getUserRegistrationEmail(username: string) {
  const emailQuery = `
    SELECT main_registration_email FROM "user"
    WHERE username = $1
  `;
  const emailRes = await processReturnQuery(emailQuery, [username]);
  return emailRes[0];
}

/**
 * Busca el código de verificación de correo activo (no expirado) para un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con los datos del código de verificación si existe.
 */
export async function getCurrentVerificationMailCode(username: string) {
  const checkQuery = `
    SELECT * FROM "verification_mail_code"
    WHERE username = $1 AND expires_at > now()
  `;
  return await processReturnQuery(checkQuery, [username]);
}

/**
 * Inserta un nuevo código de verificación de correo para un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} code - Código de verificación generado.
 */
export async function insertVerificationMailCode(username: string, code: string) {
  const insertQuery = `
    INSERT INTO "verification_mail_code" (username, code)
    VALUES ($1, $2)
  `;
  const values = [username, code];
  return await processReturnQuery(insertQuery, values);
}

/**
 * Fuerza la expiración de un código de verificación específico.
 * @param {string} username - Nombre de usuario.
 * @param {string} currentCode - Código a invalidar.
 */
export async function forceExpirationCode(username: string, currentCode: string) {
  const insertQuery = `
    UPDATE "verification_mail_code"
    SET expires_at = now() - interval '1 hour'
    WHERE username = $1 AND code = $2
  `;
  const values = [username, currentCode];
  return await processReturnQuery(insertQuery, values);
}

/**
 * Obtiene el correo electrónico secundario de registro de un usuario si existe.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con el `registration_email` secundario.
 */
export async function getUserSecondaryEmail(username: string) {
  const secondaryEmailQuery = `
    SELECT registration_email FROM "user_registration_email"
    WHERE username = $1
  `;
  const secondaryRegistrationEmail = await processReturnQuery(secondaryEmailQuery, [username]);
  return secondaryRegistrationEmail[0];
}

/**
 * Actualiza el estado del usuario a 'verified'.
 * @param {string} username - Nombre de usuario.
 */
export async function updateVerificationCode(username: string) {
  const updateQuery = `
    UPDATE "user"
    SET state = $1
    WHERE username = $2
  `;
  const values = [TokenTypes.VerificationState.VERIFIED, username];
  return await processReturnQuery(updateQuery, values);
}