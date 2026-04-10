import pool from "../config/database.config";
import { processQuery } from "../utils/process-query";
import * as UserTypes from "../types/user.types";

// Helper para centralizar la lógica
async function processUserPersonalInfo(
  username: string,
  userPersonalInfo: UserTypes.UserPersonalInfo,
  actionLabel: "registrar" | "actualizar"
) {
  try {
    const { 
      phone = null, maternalSurname = null, address = null, 
      residenceCountryId = null, contactEmail = null, profilePicture = null 
    } = userPersonalInfo;

    // 1. Validar Usuario
    const { rows: userFounded } = await pool.query("SELECT id FROM \"user\" WHERE username = $1", [username]);

    if (userFounded.length === 0) return { result: false, messageState: "Usuario no encontrado." };
    if (userFounded.length > 1) return { result: false, messageState: "Existen muchos usuarios con la misma identificacion." };

    const userId = userFounded[0].id;

    // 2. Validaciones de Negocio (Regex y Tipos)
    const phoneRegex = /^\+?[-\d\s()]{7,15}$/;
    if (phone && !phoneRegex.test(phone)) 
      return { result: false, messageState: `No se pudo ${actionLabel}... número de teléfono inválido.` };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactEmail && !emailRegex.test(contactEmail))
      return { result: false, messageState: `No se pudo ${actionLabel}... correo de contacto inválido.` };

    // 3. Persistencia (Ambos usan UPDATE según tu lógica original)
    const updateQuery = `
      UPDATE "user_detail" 
      SET phone = $1, maternal_surname = $2, address = $3, residence_country_id = $4, contact_email = $5, profile_picture = $6
      WHERE user_id = $7
    `;
    const values = [phone, maternalSurname, address, residenceCountryId, contactEmail, profilePicture, userId];
    await processQuery(updateQuery, values);

    return { 
      result: true, 
      messageState: `Datos de información personal del usuario ${actionLabel}dos exitosamente.` 
    };
  } catch (err) {
    return { result: false, messageState: `Error al ${actionLabel}: ${(err as Error).message}` };
  }
}

// Funciones exportadas limpias
export const registerUserPersonalInfo = (username: string, data: UserTypes.UserPersonalInfo) => 
  processUserPersonalInfo(username, data, "registrar");

export const updateUserPersonalInfo = (username: string, data: UserTypes.UserPersonalInfo) => 
  processUserPersonalInfo(username, data, "actualizar");