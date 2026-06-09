import * as TokenTypes from "../types/token.types";
import * as PlatformTypes from "../types/platform.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as PlatformRepository from "../repositories/platform.repository";

/**
 * La función `saveUserLinkedin` guarda o actualiza el nombre de usuario de LinkedIn para un usuario autenticado.
 * Verifica la existencia del usuario y que la plataforma 'LinkedIn' esté configurada en el sistema.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {PlatformTypes.SaveUserLinkedinInfo} saveUserLinkedinInfo - Objeto que contiene el `linkedinUsername`.
 * @returns Objeto con `result` (booleano) y `messageState` indicando el éxito o error de la operación.
 */
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

/**
 * La función `saveUserGithub` guarda o actualiza el nombre de usuario de GitHub para un usuario autenticado.
 * Verifica la existencia del usuario y que la plataforma 'GitHub' esté configurada en el sistema.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {PlatformTypes.SaveUserGithubinInfo} saveUserGithubInfo - Objeto que contiene el `githubUsername`.
 * @returns Objeto con `result` (booleano) y `messageState` indicando el éxito o error de la operación.
 */
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

/**
 * La función `getUserLinkedin` recupera el nombre de usuario de LinkedIn asociado a un usuario específico.
 * @param {any} getUserLinkedinInfo - Objeto que contiene el `username` del usuario a consultar.
 * @returns Objeto con `result`, `messageState` y `linkedinUsername` (el enlace o null si no tiene).
 */
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

/**
 * La función `getUserGithub` recupera el nombre de usuario de GitHub asociado a un usuario específico.
 * @param {any} getUserGithubInfo - Objeto que contiene el `username` del usuario a consultar.
 * @returns Objeto con `result`, `messageState` y `githubUsername` (el enlace o null si no tiene).
 */
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
