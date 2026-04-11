import bcrypt from "bcrypt";
import { PoolClient } from "pg";
import { processTransaction, processReturnQuery } from "../utils/process-query";
import { generateToken,  } from "../utils/jwt";
import * as TokenTypes from "../types/token.types";
import {  } from "../types/user.types";

export async function registerUserService(
  username: string,
  password: string,
  names: string,
  paternalSurname: string,
  maternalSurname: string
) {
  if (typeof username !== "string" || typeof password !== "string" || typeof names !== "string") {
    throw new Error("Datos de entrada inválidos o incompletos.");
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
    WHERE name = $1`;
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
    state: registrationData.user.state,
    names: registrationData.userDetail.names,
    paternalSurname: registrationData.userDetail.paternal_surname
  });

  return {
    user: registrationData.user, token
  };
}