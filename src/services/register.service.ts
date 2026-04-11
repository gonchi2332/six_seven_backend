import "../config/env.config";
import { processReturnQuery } from "../utils/process-query";
import * as UserTypes from "../types/user.types";

async function processUserPersonalInfoAction(
  username: string,
  userPersonalInfo: UserTypes.UserPersonalInfo,
  actionLabel: "registra" | "actualiza"
) {
  try {
    const {
      phone = null, maternalSurname = null, address = null,
      residenceCountryId = null, contactEmail = null, profilePicture = null
    } = userPersonalInfo;

    const checkUserQuery = "SELECT id FROM \"user\" WHERE username = $1";
    const userFounded = await processReturnQuery(checkUserQuery, [username]);

    if (userFounded.length === 0) {
      return { result: false, messageState: "Usuario no encontrado." };
    }
    if (userFounded.length > 1) {
      return { result: false, messageState: "Existen muchos usuarios con la misma identificacion." };
    }

    const userId = userFounded[0].id;

    const phoneRegex = /^\+?[-\d\s()]{7,15}$/;
    if (phone !== null && !phoneRegex.test(phone)) {
      return {
        result: false,
        messageState: `No se pudo ${actionLabel}r la informacion, numero de telefono invalido.`
      };
    }

    if (
      (maternalSurname !== null && typeof maternalSurname !== "string") ||
      (address !== null && typeof address !== "string") ||
      (residenceCountryId !== null && typeof residenceCountryId !== "number") ||
      (profilePicture !== null && typeof profilePicture !== "string")
    ) {
      return { result: false, messageState: `No se pudo ${actionLabel}r la informacion, campos invalidos.` };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactEmail !== null && !emailRegex.test(contactEmail)) {
      return { result: false, messageState: `No se pudo ${actionLabel}r la informacion, correo de contacto invalido.` };
    }

    const updateQuery = `
      UPDATE "user_detail" 
      SET 
        phone = $1, 
        maternal_surname = $2, 
        address = $3, 
        residence_country_id = $4, 
        contact_email = $5, 
        profile_picture = $6
      WHERE user_id = $7
    `;

    const values = [phone, maternalSurname, address, residenceCountryId, contactEmail, profilePicture, userId];

    await processReturnQuery(updateQuery, values);

    return {
      result: true,
      messageState: `Datos de informacion personal del usuario ${actionLabel}dos exitosamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error al ${actionLabel}r la informacion personal: ${(err as Error).message}`
    };
  }
}

export async function registerUserPersonalInfo(username: string, userPersonalInfo: UserTypes.UserPersonalInfo) {
  return processUserPersonalInfoAction(username, userPersonalInfo, "registra");
}

export async function updateUserPersonalInfo(username: string, userPersonalInfo: UserTypes.UserPersonalInfo) {
  return processUserPersonalInfoAction(username, userPersonalInfo, "actualiza");
}