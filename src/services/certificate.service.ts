import { getCertificateAction } from "../helpers/certificate.helper";
import { certificateWords } from "../utils/constants/array.constants";
import * as CertificateTypes from "../types/certificate.types";
import * as Assertions from "../helpers/assertions.helper";
import * as Inserts from "../helpers/inserts.helper";
import * as Updates from "../helpers/updates.helper";
import * as Selects from "../helpers/selects.helper";
import * as Deletes from "../helpers/deletes.helper";
import * as AIService from "../services/ai.service";

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
          messageState: "Fecha de certificacion invalida"
        };
      }
    }
    const { issueDate } = certificateInfo;

    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe"
      };
    }

    const certificateExists = await Assertions.certificateExists(certificateInfo, username);
    if (certificateExists) {
      return {
        result: false,
        messageState: "El certificado ya existe"
      };
    }

    if (action === "modify") {
      const foundCertificate = await Selects.getUserCertificate(username, id!);
      if (!foundCertificate || foundCertificate.length === 0) {
        return {
          result: false,
          messageState: "El certificado consultado no existe"
        };
      }
    }

    if (!issueDate) {
      return {
        result: false,
        messageState: "Fecha de certificacion invalida"
      };
    }
    if (issueDate) {
      if (isNaN(issueDate.getTime())) {
        return {
          result: false,
          messageState: "Fecha de certificacion invalida"
        };
      }
      if (issueDate > new Date()) {
        return {
          result: false,
          messageState: "La fecha de certificacion no puede ser futura"
        };
      }
      if (issueDate < new Date(new Date().setFullYear(new Date().getFullYear() - 100))) {
        return {
          result: false,
          messageState: "La fecha de certificacion tiene que estar dentro del rango de hoy y hace 100 años"
        };
      }
    }

    const { valid, extractedText, reason } = await AIService.certificateImageValidation(coverImage.buffer);
    if (!valid) {
      if (reason) {
        return {
          result: false,
          messageState: reason
        };
      }
      return {
        result: false,
        messageState: "Imagen del certificado invalida, no tiene texto ni caracteristicas minimas de un certificado"
      };
    }
    if (valid && extractedText) {
      const formatedText = extractedText.toLowerCase();
      const textoValido = certificateWords.some(w => formatedText.includes(w));
      if (!textoValido) {
        return {
          result: false,
          messageState: "Imagen de certificado invalida, no tiene las caracteristicas minimas de un certificado"
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
    } else {
      await Updates.updateCertificate(username, certificateInfo, coverImage, id!);
    }
    return {
      result: true,
      messageState: `Certificado ${certificateAction.singleWord} exitosamente`
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

export async function viewPublicCertificates(username: string) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) return {
      result: false,
      messageState: "El usuario no existe."
    };
    const certificates = await Selects.getAllPublicUserCertificates(username);
    return {
      result: true,
      messageState: "Certificados obtenidos",
      certificates
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function viewPrivateCertificates(username: string) {
  try {
    const certificates = await Selects.getAllUserCertificates(username);
    return {
      result: true,
      messageState: "Certificados obtenidos",
      certificates
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function deleteUserCertificate(username: string, id: number) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) return {
      result: false,
      messageState: "El usuario no existe"
    };
    const foundCertificate = await Selects.getUserCertificate(username, id);
    if (!foundCertificate || foundCertificate.length === 0) {
      return {
        result: false,
        messageState: "El certificado consultado no existe"
      };
    }
    const deletedCertificate = await Deletes.deleteUserCertificate(username, id);
    if (!deletedCertificate) {
      return {
        result: false,
        messageState: "El certificado a eliminar no esta asociado a este usuario o no existe"
      };
    }
    return {
      result: true,
      messageState: "Certificado eliminado exitosamente"
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function updateCertificatesVisibility(username: string, visibilities: Record<string, boolean>) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }
    await Updates.updateCertificatesVisibilityBulk(username, visibilities);
    return {
      result: true,
      messageState: "Visibilidad de certificados actualizada exitosamente."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}
