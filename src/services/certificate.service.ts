import { getCertificateAction } from "../helpers/certificate.helper";
import * as CertificateTypes from "../types/certificate.types";
import * as Assertions from "../helpers/assertions.helper";
import * as Inserts from "../helpers/inserts.helper";
import * as Updates from "../helpers/updates.helper";
import * as Selects from "../helpers/selects.helper";

async function manageUserCertificate(
  username: string, 
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File,
  action: "register" | "modify",
  id?: number) {
  try {
    if (certificateInfo.issueDate) {
      certificateInfo.issueDate = new Date(certificateInfo.issueDate);
      if (isNaN(certificateInfo.issueDate.getTime())) {
        return {
          result: false,
          messageState: "Fecha de certificacion invalida."
        };
      }
    }
    const { issueDate } = certificateInfo;

    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const certificateExists = await Assertions.certificateExists(certificateInfo, username);
    if (certificateExists) {
      return {
        result: false,
        messageState: "El certificado ya existe."
      };
    }

    if (!issueDate) {
      return {
        result: false,
        messageState: "Fecha de certificacion invalida."
      };
    }
    if (issueDate) {
      if (isNaN(issueDate.getTime())) {
        return {
          result: false,
          messageState: "Fecha de certificacion invalida."
        };
      }
      if (issueDate > new Date()) {
        return {
          result: false,
          messageState: "La fecha de certificacion no puede ser futura."
        };
      }
      if (issueDate < new Date(new Date().setFullYear(new Date().getFullYear() - 100))) {
        return {
          result: false,
          messageState: "La fecha de certificacion tiene que estar dentro del rango de hoy y hace 100 años."
        };
      }
    }

    const certificateAction = getCertificateAction(action);
    const validationsResult = await certificateAction.serviceValidations(certificateInfo);
    if (validationsResult && !validationsResult.result) {
      return {
        result: false,
        messageState: validationsResult.messageState
      };
    }

    if (action === "register") {
      await Inserts.createCertificate(username, certificateInfo, coverImage);
    }else {
      await Updates.updateCertificate(username, certificateInfo, coverImage, id!);
    }
    return {
      result: true,
      messageState: `Certificado ${certificateAction.singleWord} exitosamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function registerUserCertificate(
  username: string,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File) {
  return await manageUserCertificate(username, certificateInfo, coverImage, "register");
}

export async function modifyUserCertificate(
  username: string,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File,
  id: number) {
  return await manageUserCertificate(username, certificateInfo, coverImage, "modify", id);
}

export async function viewUserCertificates(username: string) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const userCertificates = await Selects.getAllUserCertificates(username);
    if (!userCertificates || userCertificates.length === 0) {
      return {
        result: true,
        messageState: "El usuario no tiene certificados registrados."
      };
    }
    return {
      result: true,
      messageState: "Certificados obtenidos exitosamente.",
      certificates: userCertificates
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}