import { getCertificateAction } from "../helpers/certificate.helper";
import { certificateWords } from "../utils/constants/array.constants";
import * as CertificateTypes from "../types/certificate.types";
import * as TokenTypes from "../types/token.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as CertificateRepository from "../repositories/certificate.repository";
import * as AIService from "../services/ai.service";

/**
 * Función interna `manageUserCertificate` que centraliza la lógica para registrar o modificar
 * un certificado del usuario. Valida la existencia del usuario y del certificado, realiza
 * validación NSFW de la imagen mediante IA, extrae y verifica el texto de la imagen del
 * certificado usando IA de visión, y finalmente crea o actualiza el registro en la base de datos.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {CertificateTypes.CertificateInfo} certificateInfo - Datos del certificado a registrar/modificar.
 * @param {Express.Multer.File} coverImage - Archivo de imagen del certificado subido por el usuario.
 * @param {"register" | "modify"} action - Acción a realizar: registrar un nuevo certificado o modificar uno existente.
 * @param {number} [id] - Identificador del certificado (requerido solo para la acción "modify").
 * @returns Objeto con `result` (booleano) y `messageState` indicando el resultado de la operación.
 */
async function manageUserCertificate(
  tokenInfo: TokenTypes.TokenPayload,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File,
  action: "register" | "modify",
  id?: number) {
  try {
    const { username } = tokenInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
    }
    const certificateExists = await CertificateRepository.certificateExists(certificateInfo, username);
    if (certificateExists) {
      return { result: false, messageState: "El certificado ya existe" };
    }
    if (action === "modify") {
      const foundCertificate = await CertificateRepository.getUserCertificate(username, id!);
      if (!foundCertificate || foundCertificate.length === 0) {
        return { result: false, messageState: "El certificado consultado no existe" };
      }
    }

    const nsfwResult = await AIService.NSFWImageValidation(coverImage.buffer);
    if (!nsfwResult.valid) {
      if (nsfwResult.reason) {
        return { result: false, messageState: nsfwResult.reason };
      }
      return { result: false, messageState: "La imagen del certificado contiene contenido obseno" };
    }
    const response = await AIService.certificateImageValidation(coverImage.buffer);
    if (!response.valid) {
      if (response.reason) {
        return { result: false, messageState: response.reason };
      }
      return {
        result: false,
        messageState: "Imagen del certificado invalida, no tiene texto ni caracteristicas minimas de un certificado"
      };
    }
    if (response.valid && response.extractedText) {
      const formatedText = response.extractedText.toLowerCase();
      const textoValido = certificateWords.some(w => formatedText.includes(w));
      if (!textoValido) {
        return {
          result: false,
          messageState: "Imagen de certificado invalida, no tiene las caracteristicas minimas de un certificado"
        };
      }
    }

    const certificateAction = getCertificateAction(action);
    if (action === "register") {
      await CertificateRepository.createCertificate(username, certificateInfo, coverImage);
    } else {
      await CertificateRepository.updateCertificate(username, certificateInfo, coverImage, id!);
    }
    return { result: true, messageState: `Certificado ${certificateAction.singleWord} exitosamente` };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

/**
 * La función `registerUserCertificate` registra un nuevo certificado asociado al usuario autenticado.
 * Delega la lógica en `manageUserCertificate` con la acción "register".
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {CertificateTypes.CertificateInfo} certificateInfo - Datos del certificado a registrar.
 * @param {Express.Multer.File} coverImage - Archivo de imagen del certificado.
 * @returns Resultado de `manageUserCertificate` con la acción "register".
 */
export async function registerUserCertificate(
  tokenInfo: TokenTypes.TokenPayload,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File) {
  return await manageUserCertificate(tokenInfo, certificateInfo, coverImage, "register");
}

/**
 * La función `modifyUserCertificate` modifica un certificado existente del usuario autenticado.
 * Parsea el ID del certificado y delega la lógica en `manageUserCertificate` con la acción "modify".
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {CertificateTypes.CertificateInfo} certificateInfo - Datos actualizados del certificado.
 * @param {Express.Multer.File} coverImage - Nueva imagen del certificado.
 * @param {any} idInfo - Objeto que contiene el `id` del certificado a modificar.
 * @returns Resultado de `manageUserCertificate` con la acción "modify".
 */
export async function modifyUserCertificate(
  tokenInfo: TokenTypes.TokenPayload,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File,
  idInfo: any) {
  const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;
  return await manageUserCertificate(tokenInfo, certificateInfo, coverImage, "modify", parsedId);
}

/**
 * La función `viewPublicCertificates` obtiene todos los certificados públicos de un usuario
 * y registra una vista de interfaz para fines analíticos.
 * @param {any} viewCertificateInfo - Objeto que contiene el `username` del usuario a consultar.
 * @returns Objeto con `result`, `messageState` y `certificates` (lista de certificados públicos).
 */
export async function viewPublicCertificates(viewCertificateInfo: any) {
  try {
    const { username } = viewCertificateInfo;

    const interfaceId = 7;
    const userExists = await CommonRepository.userExists(username);
    if (!userExists)
      return { result: false, messageState: "El usuario no existe." };

    const certificates = await CertificateRepository.getAllPublicUserCertificates(username);
    await CommonRepository.insertInterfaceView(username, interfaceId);
    return { result: true, messageState: "Certificados obtenidos", certificates };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

/**
 * La función `viewPrivateCertificates` obtiene todos los certificados (públicos y privados)
 * del usuario autenticado.
 * @param {TokenTypes.TokenPayload} viewCertificateInfo - Información del token del usuario autenticado.
 * @returns Objeto con `result`, `messageState` y `certificates` (lista completa de certificados).
 */
export async function viewPrivateCertificates(viewCertificateInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = viewCertificateInfo;

    const certificates = await CertificateRepository.getAllUserCertificates(username);
    return { result: true, messageState: "Certificados obtenidos", certificates };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

/**
 * La función `deleteUserCertificate` elimina un certificado específico del usuario autenticado.
 * Verifica la existencia del usuario y del certificado antes de proceder con la eliminación.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {any} idInfo - Objeto que contiene el `id` del certificado a eliminar.
 * @returns Objeto con `result` y `messageState` indicando si la eliminación fue exitosa o no.
 */
export async function deleteUserCertificate(
  tokenInfo: TokenTypes.TokenPayload,
  idInfo: any) {
  try {
    const { username } = tokenInfo;
    const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) return {
      result: false,
      messageState: "El usuario no existe"
    };
    const foundCertificate = await CertificateRepository.getUserCertificate(username, parsedId!);
    if (!foundCertificate || foundCertificate.length === 0) {
      return { result: false, messageState: "El certificado consultado no existe" };
    }

    const deletedCertificate = await CertificateRepository.deleteUserCertificate(username, parsedId!);
    if (!deletedCertificate) {
      return {
        result: false,
        messageState: "El certificado a eliminar no esta asociado a este usuario o no existe"
      };
    }
    return { result: true, messageState: "Certificado eliminado exitosamente" };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

/**
 * La función `updateCertificatesVisibility` actualiza la configuración de visibilidad (público/privado)
 * de múltiples certificados del usuario autenticado de forma masiva.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {CertificateTypes.UpdateCertificatesVisibilityInfo} updateCertificatesVisibilityInfo - Objeto
 * con `visibilities`, un mapa de IDs de certificados y sus nuevos estados de visibilidad.
 * @returns Objeto con `result` y `messageState` indicando el resultado de la actualización.
 */
export async function updateCertificatesVisibility(
  tokenInfo: TokenTypes.TokenPayload,
  updateCertificatesVisibilityInfo: CertificateTypes.UpdateCertificatesVisibilityInfo) {
  try {
    const { username } = tokenInfo;
    const { visibilities } = updateCertificatesVisibilityInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }

    await CertificateRepository.updateCertificatesVisibilityBulk(username, visibilities);
    return { result: true, messageState: "Cambios guardados exitosamente" };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}