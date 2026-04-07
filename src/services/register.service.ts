import "../config/env.config";
import pool from "../config/database.config";
import * as UserTypes from "../types/user.types";

export async function registerUserPersonalInfo(
  userId: number,
  username: string,
  userPersonalInfo: UserTypes.UserPersonalInfo) {
  try {
    const phone = userPersonalInfo.phone || null;
    const names = userPersonalInfo.names;
    const paternalSurname = userPersonalInfo.paternalSurname;
    const maternalSurname = userPersonalInfo.maternalSurname || null;
    const address = userPersonalInfo.address || null;
    const residenceCountryId = userPersonalInfo.residenceCountryId || null;
    const contactEmail = userPersonalInfo.contactEmail || null;
    const profilePicture = userPersonalInfo.profilePicture || null;

    const { rows: userFounded } = await pool.query(`
        SELECT * FROM user
        WHERE id = $1 AND username = $2
    `, [userId, username]);

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
    if (!paternalSurname || !names) {
      return {
        result: false,
        messageState: "No es posible registrar la informacion del usuario, hace falta campos."
      };
    }

    const { rows: userDetailFounded } = await pool.query(`
        SELECT * FROM user_detail
        WHERE id = $1
    `, [userId]);

    if (userDetailFounded.length > 1) {
      return {
        result: false,
        messageState: "Existen muchos detallles de usuario asociados a el mismo usuario."
      };
    }

    await pool.query(`
        INSERT INTO user_detail (user_id, phone, names, paternal_surname, maternal_surname, address, 
        residence_country_id, contact_email, profile_picture)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [userId, phone, names, paternalSurname, maternalSurname, address, residenceCountryId, 
      contactEmail, profilePicture]);
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