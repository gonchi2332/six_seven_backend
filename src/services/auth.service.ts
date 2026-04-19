import bcrypt from "bcrypt";
import { PoolClient } from "pg";
import { processTransaction, processReturnQuery } from "../utils/processQuery";
import { generateToken } from "../utils/jwt";
import { sendResetCodeEmail } from "../utils/mailer";
import { generateCode } from "../utils/generate";
import * as TokenTypes from "../types/token.types";

export async function registerUserService(
  username: string,
  password: string,
  names: string,
  firstSurname: string,
  mainRegistrationEmail: string
) {
  if (typeof username !== "string" || typeof password !== "string" || typeof names !== "string") {
    return {
      result: false,
      messageState: "Datos de entrada invalidos o incompleros."
    };
  }

  const checkQuery = `
    SELECT username FROM "user" 
    WHERE username = $1`;
  const existingUsers = await processReturnQuery(checkQuery,[username]);

  if (existingUsers.length > 0) {
    const error = new Error("El nombre de usuario ya está en uso");
    error.name = "ConflictError";
    throw error;
  }

  const roleQuery = `
    SELECT id FROM "role"
    WHERE name = $1
  `;
  const roles = await processReturnQuery(roleQuery, ["Usuario"]);
  const roleId = roles.length > 0 ? roles[0].id : 1;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const registrationData = await processTransaction<TokenTypes.RegistrationResult>(async function (client: PoolClient) {
    let userQuery = `
      INSERT INTO "user" (username, password, state, role_id, names, first_surname, main_registration_email)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, state, names, first_surname, main_registration_email
    `;
    const userValues = [username, hashedPassword, TokenTypes.VerificationState.UNVERIFIED, roleId, names, firstSurname, mainRegistrationEmail];
    const userRes = await client.query(userQuery, userValues);
    const newUser = userRes.rows[0];
    userQuery = `
      INSERT INTO "user_profile_picture" (username, profile_picture_id)
      VALUES ($1, 1);
    `;
    await client.query(userQuery, [username]);

    return {
      user: newUser
    };
  });

  const token = generateToken({
    username: registrationData.user.username,
    state: registrationData.user.state
  });

  return {
    result: true,
    messageState: "Usuario registrado exitosamente",
    user: registrationData.user,  
    token
  };
}

export async function login(
  username: string,
  password: string
) {

  if (typeof username !== "string" || typeof password !== "string") {
    throw new Error("Credenciales inválidas.");
  }

  const findUserQuery = `
    SELECT 
      u.username, u.password as hashed_password, u.state,
      u.names, u.first_surname, pp.profile_picture
    FROM "user" u
    LEFT JOIN "user_profile_picture" upp ON u.username = upp.username
    LEFT JOIN "profile_picture" pp ON upp.profile_picture_id = pp.id
    WHERE u.username = $1   
  `;
  const findUserValues = [username];
  const users = await processReturnQuery(findUserQuery, findUserValues);

  const foundUser = users[0];
  const profilePicture = foundUser.profile_picture;
  const proccessedProfilePicture = profilePicture.toString("base64");
  foundUser.profile_picture = `data:image/jpeg;base64,${proccessedProfilePicture}`;

  if (users.length === 0) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.name = "AuthError";
    throw error;
  }

  const isMatch = await bcrypt.compare(password, foundUser.hashed_password);

  if (!isMatch) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.name = "AuthError";
    throw error;
  }

  const token = generateToken({
    username: foundUser.username,
    state: foundUser.state
  });

  return {
    user: foundUser, 
    profilePicture: `data:image/jpeg;base64,${proccessedProfilePicture}`,
    token
  };
}

export async function resetPassword(
  username: string,
  newPassword: string,
  verificationCode: string
) {
  return await processTransaction(async function (client) {

    const findCodeQuery = `
    SELECT u.password as hashed_password
    FROM "user" u
    JOIN "password_reset_code" p ON u.username = p.username
    WHERE u.username = $1
    AND p.code = $2 
    AND p.expires_at > NOW()
  `;
    const codeRes = await processReturnQuery(findCodeQuery, [username, verificationCode]);

    if (codeRes.length === 0) {
      const error = new Error("Código de verificación inválido o expirado");
      error.name = "AuthError";
      throw error;
    }

    const { hashed_password: hashedPassword } = codeRes[0];

    const isSame = await bcrypt.compare(newPassword, hashedPassword);
    if (isSame) {
      const error = new Error("La nueva contraseña no puede ser igual a la anterior");
      error.name = "ConflictError";
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await client.query(`UPDATE "user" SET 
      password = $1 WHERE username = $2`, [newHashedPassword, username]);

    await client.query(`DELETE FROM "password_reset_code"
       WHERE username = $1`, [username]);

    return ;
  });
}

export async function forgotPasswordService(username: string) {
  try {
    const checkUserQuery = `
      SELECT username FROM "user" 
      WHERE username = $1
    `;
    const users = await processReturnQuery(checkUserQuery, [username]);

    if (users.length === 0) {
      const error = new Error("El nombre de usuario no existe.");
      error.name = "NotFoundError";
      throw error;
    }
    const resetCode = generateCode();

    const upsertCodeQuery = `
      INSERT INTO "password_reset_code" ("username", "code", "expires_at")
      VALUES ($1, $2, NOW() + INTERVAL '1 hour')
      ON CONFLICT ("username") DO UPDATE 
      SET "code" = EXCLUDED.code, "expires_at" = EXCLUDED.expires_at;
    `;
    await processReturnQuery(upsertCodeQuery, [username, resetCode]);

    const emailQuery = `
      SELECT main_registration_email FROM "user"
      WHERE username = $1
    `;
    const emailRes = await processReturnQuery(emailQuery, [username]);
    const mainRegistrationEmail = emailRes[0].main_registration_email;
    await sendResetCodeEmail(mainRegistrationEmail, username, resetCode);
    const secondaryEmailQuery = `
      SELECT registration_email FROM "user_registration_email"
      WHERE username = $1
    `;
    const secondaryRegistrationEmail = await processReturnQuery(secondaryEmailQuery, [username]);
    if (secondaryRegistrationEmail.length === 1) {
      const secondaryEmailRes = secondaryRegistrationEmail[0].registration_email;
      await sendResetCodeEmail(secondaryEmailRes, username, resetCode);
    }

    return {
      result: true,
      messageState: "Código de recuperación enviado exitosamente.",
    };
  } catch (err) {
    if ((err as Error).name === "NotFoundError") throw err;
    return {
      result: false,
      messageState: `Error al procesar la solicitud: ${(err as Error).message}`
    };
  }
}

export async function verifyCodeService(username: string, code: string): Promise<boolean> {
  const userQuery = `
    SELECT username FROM "user" 
    WHERE username = $1
  `;
  const users = await processReturnQuery(userQuery, [username]);

  if (users.length === 0) return false;

  const codeQuery = `
    SELECT username FROM "password_reset_code" 
    WHERE username = $1 AND code = $2 AND expires_at > NOW()
  `;
  const result = await processReturnQuery(codeQuery, [username, code]);

  return result.length > 0;
}