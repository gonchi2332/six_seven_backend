import "../config/env.config";
import { PoolClient } from "pg";
import { processTransaction, processReturnQuery } from "../utils/processQuery";
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
      firstSurname = null,
      secondSurname = null, 
      residenceCity = null,
      residenceCountry = null, 
      contactEmail = null, 
    } = userPersonalInfo;

    let checkQuery = `
      SELECT names, first_surname FROM "user" 
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
      (firstSurname !== null && typeof firstSurname !== "string") ||
      (secondSurname !== null && typeof secondSurname !== "string")) {
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

    await processTransaction<unknown>(async function (client: PoolClient) {
      let residenceCityId : number | undefined = undefined;
      if (residenceCity) {
        if (typeof residenceCity !== "string") {
          return {
            return: false,
            messageState: `No se pudo ${actionLabel}r la informacion, ciudad de residencia invalida.`
          };
        }
        checkQuery = `
          SELECT id FROM residence_city
          WHERE name = $1
        `;
        const { rows: foundedCities } = await client.query(checkQuery, [residenceCity]);
        if (foundedCities.length === 0) {
          const insertionQuery = `
            INSERT INTO "residence_city" (name)
            VALUES ($1)
            RETURNING id
          `;
          const { rows: newCity } = await client.query(insertionQuery, [residenceCity]);
          residenceCityId = newCity[0].id;
        } else {
          residenceCityId = foundedCities[0].id;
        }
      }

      let residenceCountryId : number | undefined = undefined;
      if (residenceCountry) {
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
        const { rows: foundedCountries } = await client.query(checkQuery, [residenceCountry]);
        if (foundedCountries.length === 0) {
          const insertionQuery = `
            INSERT INTO "residence_country" (name)
            VALUES ($1)
            RETURNING id
          `;
          const { rows: newCountry } = await client.query(insertionQuery, [residenceCountry]); 
          residenceCountryId = newCountry[0].id;
        } else {
          residenceCountryId = foundedCountries[0].id;
        }
      }

      let profilePictureId: number = 1;
      if (profilePicture) {
        checkQuery = `
          SELECT setval(pg_get_serial_sequence('"profile_picture"', 'id'),
          (SELECT MAX(id) FROM "profile_picture"));
        `;
        await client.query(checkQuery);
        const insertQuery = `
          INSERT INTO "profile_picture" (profile_picture)
          VALUES ($1)
          RETURNING id
        `;
        const currentProfilePicture = await client.query(insertQuery, [profilePicture.buffer]);
        profilePictureId = currentProfilePicture.rows[0].id;
      }

      const currentNames = (names) ? names : userFounded[0].names;
      const currentFirstSurname = (firstSurname) ? firstSurname : userFounded[0].first_surname;
      const insertQuery = `
        UPDATE "user"
        SET 
          names = $1,
          first_surname = $2
        WHERE username = $3
        `;
      const values = [currentNames, currentFirstSurname, username];
      await client.query(insertQuery, values);
      
      if (secondSurname) {
        const insertQuery = `
          INSERT INTO "user_second_surname" (username, second_surname)
          VALUES ($1, $2)
          ON CONFLICT (username) DO UPDATE SET second_surname = EXCLUDED.second_surname
      `;
        const values = [username, secondSurname];
        await client.query(insertQuery, values); 
      }
      
      if (phone) {
        const insertQuery = `
          INSERT INTO "user_phone_number" (username, phone_number)
          VALUES ($1, $2)
          ON CONFLICT (username) DO UPDATE SET phone_number = EXCLUDED.phone_number
        `;
        const values = [username, phone];
        await client.query(insertQuery, values);
      }

      if (residenceCityId) {
        const insertQuery = `
          INSERT INTO "user_residence_city" (username, residence_city_id)
            VALUES ($1, $2)
            ON CONFLICT (username) DO UPDATE SET residence_city_id = EXCLUDED.residence_city_id
        `;
        const values = [username, residenceCityId];
        await client.query(insertQuery, values);
      }

      if (residenceCountryId) {
        const insertQuery = `
          INSERT INTO "user_residence_country" (username, residence_country_id)
          VALUES ($1, $2)
          ON CONFLICT (username) DO UPDATE SET residence_country_id = EXCLUDED.residence_country_id
      `;
        const values = [username, residenceCountryId];
        await client.query(insertQuery, values);
      }

      if (contactEmail) {
        const insertQuery = `
          INSERT INTO "user_contact_email" (username, contact_email)
          VALUES ($1, $2)
          ON CONFLICT (username) DO UPDATE SET contact_email = EXCLUDED.contact_email
        `;
        const values = [username, contactEmail];
        await client.query(insertQuery, values);
      }

      if (profilePictureId !== 1) {
        const insertQuery = `
          INSERT INTO "user_profile_picture" (username, profile_picture_id)
          VALUES ($1, $2)
          ON CONFLICT (username) DO UPDATE SET profile_picture_id = EXCLUDED.profile_picture_id
        `;
        const values = [username, profilePictureId];
        await client.query(insertQuery, values);
      }
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
    const checkQuery = `
      SELECT username FROM "user"
      WHERE username = $1
    `;
    const userFounded = await processReturnQuery(checkQuery, [username]);
    if (userFounded.length === 0) {
      return { 
        result: false, 
        messageState: "Usuario no encontrado." 
      };
    }

    const getQuery = `
      SELECT 
        u.username, u.state, u.names, u.first_surname, upn.phone_number, umn.second_surname, 
        rci.name AS residence_city_name, rc.name AS residence_country_name, uce.contact_email, 
        pp.profile_picture
      FROM "user" u
      LEFT JOIN "user_phone_number" upn ON u.username = upn.username
      LEFT JOIN "user_second_surname" umn ON u.username = umn.username
      LEFT JOIN "user_residence_city" urci ON u.username = urci.username
      LEFT JOIN "residence_city" rci ON urci.residence_city_id = rci.id
      LEFT JOIN "user_residence_country" urc ON u.username = urc.username
      LEFT JOIN "residence_country" rc ON urc.residence_country_id = rc.id
      LEFT JOIN "user_contact_email" uce ON u.username = uce.username
      LEFT JOIN "user_profile_picture" upp ON u.username = upp.username
      LEFT JOIN "profile_picture" pp ON upp.profile_picture_id = pp.id
      WHERE u.username = $1
    `;
    const values = [username];
    const usersPersonalInfo = await processReturnQuery(getQuery, values);

    let personalInfo = usersPersonalInfo[0];
    const profilePicture = personalInfo.profile_picture;
    if (profilePicture) {
      personalInfo.profile_picture = `data:image/jpeg;base64,${profilePicture.toString("base64")}`;
    } else {
      personalInfo.profile_picture = null;
    }

    personalInfo = Object.fromEntries(Object.entries(personalInfo).filter(([, value]) => value !== null));
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