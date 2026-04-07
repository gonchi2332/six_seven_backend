import bcrypt from 'bcrypt';
import pool from '../config/database.config';
import { generateToken } from '../utils/jwt';

export async function registerUserService(username: string, email: string, password: string) {
  const checkQuery = 'SELECT id, email FROM "user" WHERE email = $1 OR username = $2';
  const { rows: existingUsers } = await pool.query(checkQuery, [email, username]);
  
  if (existingUsers.length > 0) {
    const isEmail = existingUsers.some(u => u.email === email);
    const error = new Error(isEmail ? 'Este correo electrónico ya está en uso' : 'El nombre de usuario ya está en uso');
    error.name = 'ConflictError';
    throw error;
  }

  const roleQuery = 'SELECT id FROM "role" WHERE name = $1';
  const roleResult = await pool.query(roleQuery, ['Usuario']);
  const rolId = roleResult.rows.length > 0 ? roleResult.rows[0].id : 1; 

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertQuery = `
    INSERT INTO "user" (username, email, password, state, role_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, email, state, role_id, public_profile_link
  `;
  const values = [username, email, hashedPassword, 'no verificado', rolId];
  const { rows: newUsers } = await pool.query(insertQuery, values);
  const newUser = newUsers[0];

  const token = generateToken({
    id: newUser.id,
    username: newUser.username,
    role_id: newUser.role_id,
    state: newUser.state
  });

  return { user: newUser, token };
}
