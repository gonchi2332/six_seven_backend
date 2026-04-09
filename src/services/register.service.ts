import "../config/env.config";
import pool from "../config/database.config";
import * as UserTypes from "../types/user.types";

export async function registerUserPersonalInfo(
  username: string,
  userPersonalInfo: UserTypes.UserPersonalInfo) {
  try {
    const phone = userPersonalInfo.phone || null;
    const maternalSurname = userPersonalInfo.maternalSurname || null;
    const address = userPersonalInfo.address || null;
    const residenceCountryId = userPersonalInfo.residenceCountryId || null;
    const contactEmail = userPersonalInfo.contactEmail || null;
    const profilePicture = userPersonalInfo.profilePicture || null;

    let checkQuery = `
      SELECT * FROM "user"
      WHERE username = $1
    `;
    let values = [username];
    const { rows: userFounded } = await pool.query(checkQuery, values);

    if (userFounded.length === 0) {
      return {
        result: false,
        messageState: "Usuario no encontrado."
      };
    }
    if (userFounded.length > 1) {
      return {
        result: false,
        messageState: "Existen muchos usuarios con la misma identificacion."
      };
    }
    const phoneRegex = /^\+?[-\d\s()]{7,15}$/;
    if (phone !== null && !phoneRegex.test(phone)) {
      return {
        result: false,
        messageState: "No se pudo registrar la informacion del usuario, numero de telefono invalido."
      };
    }
    if (maternalSurname !== null && typeof maternalSurname !== "string" ||
        address !== null && typeof address !== "string" ||
        residenceCountryId !== null && typeof residenceCountryId !== "number") {
      return {
        result: false,
        messageState: "No se pudo registrar la informacion del usuario, campos invalidos."
      };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactEmail !== null && !emailRegex.test(contactEmail)) {
      return {
        result: false,
        messageState: "No se pudo registrar la informacion del usuario, correo de contacto invalido."
      };
    }

    checkQuery = `
      SELECT * FROM "user_detail"
      WHERE user_id = $1
    `;
    const userId = userFounded[0].id;
    const { rows: userDetailFounded } = await pool.query(checkQuery, [userId]);

    if (userDetailFounded.length > 1) {
      return {
        result: false,
        messageState: "Existen muchos detallles de usuario asociados a el mismo usuario."
      };
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
    values = [phone, maternalSurname, address, residenceCountryId, contactEmail, profilePicture, userId];
    await pool.query(updateQuery, values);
    return {
      result: true,
      messageState: "Datos de informacion personal del usuario registrados exitosamente."
    };   
  } catch (err) {
    return {
      result: false,
      messageState: `Error al registrar la informacion personal del usuario: ${(err as Error).message}`
    };
  }
}