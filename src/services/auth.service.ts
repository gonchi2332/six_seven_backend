import bcrypt from "bcrypt";
import { PoolClient } from "pg";
import { processTransaction, processReturnQuery } from "../utils/process-query";
import { generateToken } from "../utils/jwt";
import * as TokenTypes from "../types/token.types";

export async function registerUserService(
  username: string,
  password: string,
  names: string,
  paternalSurname: string,
  maternalSurname: string
) {
  try {
    if (typeof username !== "string" || typeof password !== "string" || typeof names !== "string") {
      return {
        result: false,
        messageState: "Datos de entrada invalidos o incompleros."
      };
    }

    const checkQuery = `
      SELECT id FROM "user" 
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
      const userQuery = `
        INSERT INTO "user" (username, password, state, role_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, state
      `;
      const userValues = [username, hashedPassword, TokenTypes.VerificationState.UNVERIFIED, roleId];
      const userRes = await client.query(userQuery, userValues);
      const newUser = userRes.rows[0];

      const detailQuery = `
        INSERT INTO "user_detail" (user_id, names, paternal_surname, maternal_surname)
        VALUES ($1, $2, $3, $4)
        RETURNING names, paternal_surname, maternal_surname
      `;
      const detailValues = [newUser.id, names, paternalSurname, maternalSurname];
      const detailRes = await client.query(detailQuery, detailValues);
      const newUserDetail = detailRes.rows[0];

      return {
        user: newUser,
        userDetail: newUserDetail
      };
    });

    const token = generateToken({
      username: registrationData.user.username,
    });

    return {
      result: true,
      messageState: "Usuario registrado exitosamente",
      user: registrationData.user,  
      token
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error al registrar usuario: ${(err as Error).message}`
    };
  }
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
      u.id, u.username, u.password as hashed_password, u.state,
      ud.names, ud.paternal_surname, ud.profile_picture_id
    FROM "user" u
    JOIN "user_detail" ud ON u.id = ud.user_id
    WHERE u.username = $1 
  `;
  const findUserValues = [username];
  const users = await processReturnQuery(findUserQuery, findUserValues);
  const profilePictureId = users[0].profile_picture_id;

  const getProfilePictureQuery = `
    SELECT profile_picture FROM "profile_picture"
    WHERE id = $1
  `;
  const getProfilePictureValues = [profilePictureId];
  const userProfilePicture = await processReturnQuery(getProfilePictureQuery, getProfilePictureValues);
  const profilePicture : Buffer = userProfilePicture[0].profile_picture;
  const proccessedProfilePicture = profilePicture.toString("base64");

  if (users.length === 0) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.name = "AuthError";
    throw error;
  }

  const foundUser = users[0];

  const isMatch = await bcrypt.compare(password, foundUser.hashed_password);

  if (!isMatch) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.name = "AuthError";
    throw error;
  }

  const token = generateToken({
    username: foundUser.username
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
    SELECT 
    u.id, u.password as hashed_password
    FROM "user" u
    JOIN "password_reset_code" p ON u.id = p.user_id
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

    const { id: userId, hashed_password: hashedPassword } = codeRes[0];

    const isSame = await bcrypt.compare(newPassword, hashedPassword);
    if (isSame) {
      const error = new Error("La nueva contraseña no puede ser igual a la anterior");
      error.name = "ConflictError";
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await client.query(`UPDATE "user" SET 
      password = $1 WHERE id = $2`, [newHashedPassword, userId]);

    await client.query(`DELETE FROM "password_reset_code"
       WHERE user_id = $1`, [userId]);

    return ;
  });
}