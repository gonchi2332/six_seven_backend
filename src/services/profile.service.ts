import "../config/env.config";
import crypto from "crypto";
import { processReturnQuery } from "../utils/query";
import * as Selects from "../helpers/selects.helper";
import * as Assertions from "../helpers/assertions.helper";

export async function getOrCreatePublicLink(username: string) {
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
    let values = [username];
    const querySelect = "SELECT public_profile_link FROM \"user\" WHERE username = $1";
    const userPublicLink = await processReturnQuery(querySelect, values);

    const profilelink = userPublicLink[0].public_profile_link;
    const baseUrl = `http://localhost:${process.env.PORT}`;

    if (profilelink) {
      return {
        result: true,
        messageState: `Enlace de perfil publico de ${username} correctamente obtenida.`,
        publicProfileLink:  `${baseUrl}/profile/${profilelink}`,
      };
    }

    const hash = crypto.randomBytes(3).toString("hex");
    const cleanUsername = username.toLowerCase().replace(/\s+/g, "_");
    const publicLink = `${hash}/${cleanUsername}`;

    const queryUpdate = "UPDATE \"user\" SET public_profile_link = $1 WHERE username = $2";
    values = [publicLink, username];
    await processReturnQuery(queryUpdate, values);
    return {
      result: true,
      messageState: "Enlace de perfil publico de ${username} correctamente obtenida.",
      publicProfileLink: `${baseUrl}/profile/${publicLink}`
    };
  }

  catch (err) {
    return {
      result: false,
      messageState: `Error al acceder a link del enlace publico: ${(err as Error).message}`
    };
  }
}

export async function getAllPublicUsersList() {
  try {
    const users = await Selects.getAllBasicUsers();
    return { 
      result: true, 
      messageState: "Lista de usuarios obtenida exitosamente", 
      users: users 
    };
  } catch (err) {
    return { 
      result: false, 
      messageState: `Error interno: ${(err as Error).message}` 
    };
  }
}


export async function getSectionsVisibility(username: string) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe"
      };
    }
    const visibilityStatus = await Selects.getUserSectionsVisibility(username);
    const sections = {
      has_projects: Boolean(visibilityStatus.has_projects),
      has_hard_skills: Boolean(visibilityStatus.has_hard_skills),
      has_education: Boolean(visibilityStatus.has_education),
      has_certificates: Boolean(visibilityStatus.has_certificates),
      has_soft_skills: Boolean(visibilityStatus.has_soft_skills),
      has_work_experience: Boolean(visibilityStatus.has_work_experience),
    };
    return {
      result: true,
      messageState: "Visibilidad de secciones obtenida exitosamente",
      sections
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}
