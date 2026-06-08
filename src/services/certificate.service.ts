import { getCertificateAction } from "../helpers/certificate.helper";
import { certificateWords } from "../utils/constants/array.constants";
import * as CertificateTypes from "../types/certificate.types";
import * as TokenTypes from "../types/token.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as CertificateRepository from "../repositories/certificate.repository";
import * as AIService from "../services/ai.service";

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

export async function registerUserCertificate(
  tokenInfo: TokenTypes.TokenPayload,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File) {
  return await manageUserCertificate(tokenInfo, certificateInfo, coverImage, "register");
}

export async function modifyUserCertificate(
  tokenInfo: TokenTypes.TokenPayload,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File,
  idInfo: any) {
  const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;
  return await manageUserCertificate(tokenInfo, certificateInfo, coverImage, "modify", parsedId);
}

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

export async function viewPrivateCertificates(viewCertificateInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = viewCertificateInfo;

    const certificates = await CertificateRepository.getAllUserCertificates(username);
    return { result: true, messageState: "Certificados obtenidos", certificates };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

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