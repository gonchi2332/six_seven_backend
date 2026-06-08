import * as TokenTypes from "../types/token.types";
import * as PlatformTypes from "../types/platform.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as PlatformRepository from "../repositories/platform.repository";

export async function saveUserLinkedin(
  tokenInfo: TokenTypes.TokenPayload,
  saveUserLinkedinInfo: PlatformTypes.SaveUserLinkedinInfo) {
  try {
    const { username } = tokenInfo;
    const { linkedinUsername } = saveUserLinkedinInfo;

    const checkUser = await CommonRepository.findByUsername(username);
    if (checkUser.length === 0) {
      return { result: false, messageState: "El usuario no existe." };
    }

    const platforms = await PlatformRepository.findPlatforms("LinkedIn");
    if (platforms.length === 0) {
      return { result: false, messageState: "La plataforma 'LinkedIn' no está configurada en la base de datos." };
    }
    const platformId = platforms[0].id;
    await PlatformRepository.insertOrUpdatePlatform(platformId, username, linkedinUsername);
    return { result: true, messageState: "Perfil de LinkedIn guardado correctamente." };
  } catch (err) {
    return { result: false, messageState: `Error en el servidor: ${(err as Error).message}` };
  }
}

export async function saveUserGithub(
  tokenInfo: TokenTypes.TokenPayload,
  saveUserGithubInfo: PlatformTypes.SaveUserGithubinInfo) {
  try {
    const { username } = tokenInfo;
    const { githubUsername } = saveUserGithubInfo;

    const checkUser = await CommonRepository.findByUsername(username);
    if (checkUser.length === 0) {
      return { result: false, messageState: "El usuario no existe" };
    }

    const platforms = await PlatformRepository.findPlatforms("GitHub");
    if (platforms.length === 0) {
      return { result: false, messageState: "La plataforma 'GitHub' no está configurada en la base de datos" };
    }
    const platformId = platforms[0].id;
    await PlatformRepository.insertOrUpdatePlatform(platformId, username, githubUsername);
    return { result: true, messageState: "Perfil de GitHub guardado correctamente" };
  } catch (err) {
    return { result: false, messageState: `Error en el servidor: ${(err as Error).message}` };
  }
}

export async function getUserLinkedin(getUserLinkedinInfo: any) {
  try {
    const { username } = getUserLinkedinInfo;

    const checkUser = await CommonRepository.findByUsername(username);
    if (checkUser.length === 0) {
      return { result: false, messageState: "El usuario no existe." };
    }

    const userPlatforms = await PlatformRepository.findUserPlatform(username, "LinkedIn");
    if (userPlatforms.length === 0) {
      return { 
        result: true, 
        messageState: "El usuario no tiene un perfil de LinkedIn registrado.",
        linkedinUsername: null
      };
    }
    return { 
      result: true, 
      messageState: "Perfil de LinkedIn obtenido correctamente.",
      linkedinUsername: userPlatforms[0].link 
    };
  } catch (err) {
    return { result: false, messageState: `Error en el servidor: ${(err as Error).message}` };
  }
}

export async function getUserGithub(getUserGithubInfo: any) {
  try {
    const { username } = getUserGithubInfo; 

    const checkUser = await CommonRepository.findByUsername(username);
    if (checkUser.length === 0) {
      return { result: false, messageState: "El usuario no existe" };
    }

    const userPlatforms = await PlatformRepository.findUserPlatform(username, "GitHub");
    if (userPlatforms.length === 0) {
      return { 
        result: true, 
        messageState: "El usuario no tiene un perfil de GitHub registrado",
        githubUsername: null
      };
    }
    return { 
      result: true, 
      messageState: "Perfil de GitHub obtenido correctamente",
      githubUsername: userPlatforms[0].link 
    };
  } catch (err) {
    return { result: false, messageState: `Error en el servidor: ${(err as Error).message}` };
  }
}