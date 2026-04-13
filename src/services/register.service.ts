import "../config/env.config";
import { PoolClient } from "pg";
import { processTransaction, processReturnQuery } from "../utils/process-query";
import * as UserTypes from "../types/user.types";

async function processUserPersonalInfoAction(
  username: string,
  userPersonalInfo: UserTypes.UserPersonalInfo,
  profilePicture: Express.Multer.File | null,
  actionLabel: "registra" | "actualiza"
) {
  try {
    const {
      phone = null,
      names = null,
      paternalSurname = null,
      maternalSurname = null, 
      address = null,
      residenceCountry = null, 
      contactEmail = null, 
    } = userPersonalInfo;

    let checkQuery = `
      SELECT id FROM "user" 
      WHERE username = $1
    `;
    const userFounded = await processReturnQuery(checkQuery, [username]);

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
        messageState: `No se pudo ${actionLabel}r la informacion, numero de telefono invalido.`
      };
    }
    if ((names !== null && typeof names !== "string") || 
      (paternalSurname !== null && typeof paternalSurname !== "string") ||
      (maternalSurname !== null && typeof maternalSurname !== "string") ||
      (address !== null && typeof address !== "string")) {
      return {
        result: false,
        messageState: `No se pudo ${actionLabel}r la informacion, campos invalidos.`
      };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactEmail !== null && !emailRegex.test(contactEmail)) {
      return { 
        result: false, 
        messageState: `No se pudo ${actionLabel}r la informacion, correo de contacto invalido.` 
      };
    }

    const userId = userFounded[0].id;
    checkQuery = `
      SELECT names, paternal_surname, maternal_surname FROM "user_detail"
      WHERE user_id = $1
    `;
    const userDetailFounded = await processReturnQuery(checkQuery, [userId]);
    const currentNames = (!names) ? userDetailFounded[0].names : names;
    const currentPaternalSurname = (!paternalSurname) ? userDetailFounded[0].paternal_surname : paternalSurname;
    const currentMaternalSurname = (!maternalSurname) ? userDetailFounded[0].maternal_surname : maternalSurname;

    await processTransaction<unknown>(async function (client: PoolClient) {
      let residenceCountryId : number | undefined = undefined;
      if (residenceCountry !== null && typeof residenceCountryId !== "string") {
        if (typeof residenceCountry !== "string") {
          return {
            return: false,
            messageState: `No se pudo ${actionLabel}r la informacion, pais de residencia invalido.`
          };
        }
        checkQuery = `
          SELECT id FROM residence_country
          WHERE name = $1
        `;
        const foundedCountries = await processReturnQuery(checkQuery, [residenceCountry]);
        if (foundedCountries.length === 0) {
          const insertionQuery = `
            INSERT INTO "residence_country" (name)
            VALUES ($1)
            RETURNING id
          `;
          const newCountry = await processReturnQuery(insertionQuery, [residenceCountry]); 
          residenceCountryId = newCountry[0].id;
        } else {
          residenceCountryId = foundedCountries[0].id;
        }
      }

      let profilePictureId: number = 1;
      if (profilePicture) {
        const insertQuery = `
          INSERT INTO "profile_picture" (profile_picture)
          VALUES ($1)
          RETURNING id
        `;
        const currentProfilePicture = await client.query(insertQuery, [profilePicture.buffer]);
        profilePictureId = currentProfilePicture.rows[0].id;
        checkQuery = `
          SELECT setval(pg_get_serial_sequence('"profile_picture"', 'id'),
          (SELECT MAX(id) FROM "profile_picture"));
        `;
        await client.query(checkQuery);
      }
  
      const updateQuery = `
        UPDATE "user_detail" 
        SET 
          phone = $1, 
          names = $2,
          paternal_surname = $3,
          maternal_surname = $4, 
          address = $5, 
          residence_country_id = $6, 
          contact_email = $7,
          profile_picture_id = $8
        WHERE user_id = $9
      `;
      const values = [phone, currentNames, currentPaternalSurname, currentMaternalSurname, address, 
        residenceCountryId, contactEmail, profilePictureId, userId];
      await client.query(updateQuery, values);
    });
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

export async function registerUserPersonalInfo(
  username: string, 
  userPersonalInfo: UserTypes.UserPersonalInfo,
  profilePicture: Express.Multer.File | null) {
  return processUserPersonalInfoAction(username, userPersonalInfo, profilePicture, "registra");
}

export async function updateUserPersonalInfo(
  username: string, 
  userPersonalInfo: UserTypes.UserPersonalInfo,
  profilePicture: Express.Multer.File | null) {
  return processUserPersonalInfoAction(username, userPersonalInfo, profilePicture, "actualiza");
}

export async function viewUserPersonalInfo(username: string){
  try {
    const getQuery = `
      SELECT 
        u.username, u.state, ud.phone, ud.names, ud.paternal_surname, ud.maternal_surname, 
        ud.address, rc.name, ud.contact_email, pp.profile_picture
      FROM "user" u
      LEFT JOIN "user_detail" ud ON u.id = ud.user_id
      LEFT JOIN "residence_country" rc ON ud.residence_country_id = rc.id
      LEFT JOIN "profile_picture" pp ON ud.profile_picture_id = pp.id
      WHERE username = $1
    `;
    const values = [username];
    const usersPersonalInfo = await processReturnQuery(getQuery, values);

    const personalInfo = usersPersonalInfo[0];
    const profilePicture = personalInfo.profile_picture;
    if (profilePicture) {
      personalInfo.profile_picture = `data:image/jpeg;base64,${profilePicture.toString("base64")}`;
    } else {
      personalInfo.profile_picture = null;
    }
    return {
      result: true,
      messageState: `Infomacion personal de ${username} correctamente obtenida.`,
      currentPersonalInfo: personalInfo,
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error al acceder a la informacion personal: ${(err as Error).message}`
    };
  }
}