import { PoolClient } from "pg";
import { processReturnQuery, processTransaction } from "../utils/query.util";
import * as UserTypes from "../types/user.types";

export async function updateIsNew(username: string) {
  const updateQuery = `
    UPDATE "user" 
    SET is_new = FALSE
    WHERE username = $1
  `;
  const values = [username];
  return await processReturnQuery(updateQuery, values);
}

export async function findUser(username: string) {
  const findQuery = `
    SELECT * FROM "user"
    WHERE username = $1
  `;
  const foundUsers = await processReturnQuery(findQuery, [username]);
  return foundUsers[0];
}

export async function createUser(
  username: string,
  currentUserNames: string,
  currentUserFirstSurname: string,
  userPersonalInfo: UserTypes.UserPersonalInfo,
  profilePicture: Express.Multer.File | null) {
  const {
    phone = null,
    names = null,
    firstSurname = null,
    secondSurname = null,
    residenceCity = null,
    residenceCountry = null,
    contactEmail = null,
    secondaryRegistrationEmail = null
  } = userPersonalInfo;

  return await processTransaction<unknown>(async function (client: PoolClient) {
    let residenceCityId: number | undefined = undefined;
    if (residenceCity) {
      const checkQuery = `
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

    let residenceCountryId: number | undefined = undefined;
    if (residenceCountry) {
      const checkQuery = `
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
      const checkQuery = `
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

    const currentNames = (names) ? names : currentUserNames;//userFounded[0].names;
    const currentFirstSurname = (firstSurname) ? firstSurname : currentUserFirstSurname;//userFounded[0].first_surname;
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
    if (secondaryRegistrationEmail) {
      const insertQuery = `
        INSERT INTO "user_registration_email" (username, registration_email)
        VALUES ($1, $2)
        ON CONFLICT (username) DO UPDATE SET registration_email = EXCLUDED.registration_email
      `;
      const values = [username, secondaryRegistrationEmail];
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
}

export async function getUserPersonalInfo(username: string) {
  const getQuery = `
    SELECT 
      u.username, u.is_new, u.state, u.names, u.first_surname, u.main_registration_email, 
      u.show_name, u.show_contact_email, u.show_phone, u.show_residence,
      upn.phone_number, umn.second_surname, rci.name AS residence_city_name, 
      rc.name AS residence_country_name, uce.contact_email, 
      ure.registration_email, pp.profile_picture
    FROM "user" u
    LEFT JOIN "user_phone_number" upn ON u.username = upn.username
    LEFT JOIN "user_second_surname" umn ON u.username = umn.username
    LEFT JOIN "user_residence_city" urci ON u.username = urci.username
    LEFT JOIN "residence_city" rci ON urci.residence_city_id = rci.id
    LEFT JOIN "user_residence_country" urc ON u.username = urc.username
    LEFT JOIN "residence_country" rc ON urc.residence_country_id = rc.id
    LEFT JOIN "user_contact_email" uce ON u.username = uce.username
    LEFT JOIN "user_registration_email" ure ON u.username = ure.username
    LEFT JOIN "user_profile_picture" upp ON u.username = upp.username
    LEFT JOIN "profile_picture" pp ON upp.profile_picture_id = pp.id
    WHERE u.username = $1
  `;
  return await processReturnQuery(getQuery, [username]);
}

export async function updatePersonalInfoVisibility(username: string, fieldsToUpdate: Record<string, boolean>) {
  const keys = Object.keys(fieldsToUpdate);
  const values: (boolean | string)[] = Object.values(fieldsToUpdate);
  const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(", ");
  const query = `
    UPDATE "user" 
    SET ${setClause}
    WHERE username = $${keys.length + 1}
  `;
  values.push(username);
  return await processReturnQuery(query, values);
}