import "../config/env.config";
import crypto from "crypto";
import * as TokenTypes from "../types/token.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as ProfileRepository from "../repositories/profile.repository";

export async function getOrCreatePublicLink(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const userFound = await CommonRepository.findByUsername(username);
    if (userFound.length === 0) {
      return { result: false, messageState: "Usuario no encontrado." };
    }

    const userPublicLink = await ProfileRepository.getProfileLink(username);
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
    await ProfileRepository.updateProfileLink(publicLink, username);
    return {
      result: true,
      messageState: `Enlace de perfil publico de ${username} correctamente obtenida.`,
      publicProfileLink: `${baseUrl}/profile/${publicLink}`
    };
  }
  catch (err) {
    return { result: false, messageState: `Error al acceder a link del enlace publico: ${(err as Error).message}` };
  }
}

export async function getAllPublicUsersList() {
  try {
    const users = await ProfileRepository.getAllBasicUsers();
    return { 
      result: true, 
      messageState: "Lista de usuarios obtenida exitosamente", 
      users: users 
    };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

export async function getSectionsVisibility(getSectionsVisibilityInfo: any) {
  try {
    const { username } = getSectionsVisibilityInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
    }
    
    const visibilityStatus = await ProfileRepository.getUserSectionsVisibility(username);
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
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}