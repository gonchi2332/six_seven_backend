import bcrypt from "bcrypt";
import pool from "../config/database.config";
import { generateToken } from "../utils/jwt";
import * as TokenTypes from "../types/token.types";

export async function registerUserService(
  username: string, 
  password: string, 
  names: string, 
  paternalSurname: string) {
  const checkQuery = `
    SELECT id FROM "user" 
    WHERE username = $1`;
  const { rows: existingUsers } = await pool.query(checkQuery, [username]);
  
  if (existingUsers.length > 0) {
    const error = new Error("El nombre de usuario ya está en uso");
    error.name = "ConflictError";
    throw error;
  }

  const roleQuery = `
    SELECT id FROM "role"
    WHERE name = $1`;
  const roleResult = await pool.query(roleQuery, ["Usuario"]);
  const roleId = roleResult.rows.length > 0 ? roleResult.rows[0].id : 1; 

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let insertQuery = `
    INSERT INTO "user" (username, password, state, role_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, state
  `;
  let values = [username, hashedPassword, TokenTypes.VerificationState.NO_VERIFICADO, roleId];
  const { rows: newUsers } = await pool.query(insertQuery, values);
  const newUser = newUsers[0];

  insertQuery = `
    INSERT INTO "user_detail" (user_id, names, paternal_surname)
    VALUES ($1, $2, $3)
    RETURNING names, paternal_surname
  `;
  values = [newUser.id, names, paternalSurname];
  const { rows: newUsersDetails } = await pool.query(insertQuery, values);
  const newUserDetail = newUsersDetails[0];

  const token = generateToken({
    username: newUser.username,
    state: newUser.state,
    names: newUserDetail.names,
    paternalSurname: newUserDetail.paternal_surname
  });

  return { user: newUser, token };
}