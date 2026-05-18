import { profanity, uniqueWords, uniqueTrickyWords } from "../config/leoprofanity.config";
import { containsBadWord, isGarbageInput } from "../utils/validations";
import * as RegexConstants from "../utils/constants/regex.constants";
import * as CertificateTypes from "../types/certificate.types";
import * as Assertions from "../helpers/assertions.helper";
import * as Inserts from "../helpers/inserts.helper";

export async function registerUserCertificate(
  username: string, 
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File) {
  try {
    const { title, description, area, issueDate } = certificateInfo;

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

    if ((!title || typeof title !== "string") ||
      (!description || typeof description !== "string") ||
      (!area || typeof area !== "string")) {
      return {
        result: false,
        messageState: "Datos del certificado incompletos o invalidos."
      };
    }
    if ((title.length < 0 || title.length > 100) || 
      (area.length < 0 || area.length > 100)) {
      return {
        result: false,
        messageState: "Titulo o area del certificado fuera del rango de caracteres permitido."
      };
    }
    if (!RegexConstants.certificateTitleRegex.test(title) || profanity.check(title) || 
      containsBadWord(title, uniqueWords, uniqueTrickyWords) || isGarbageInput(title)) {
      return {
        result: false,
        messageState: "Titulo del certificado invalido."
      };
    }
    if (!RegexConstants.areaRegex.test(area) || profanity.check(area) || 
      containsBadWord(area, uniqueWords, uniqueTrickyWords) || isGarbageInput(area)) {
      return {
        result: false,
        messageState: "Area invalida."
      };
    }
    if (description.length < 0 || description.length > 200) {
      return {
        result: false,
        messageState: "Descripción del certificado fuera del rango de caracteres permitido."
      };
    }
    if (!issueDate) {
      return {
        result: false,
        messageState: "Fecha de certificacion invalida."
      };
    }
    if (issueDate) {
      const formatedIssueDate = new Date(issueDate);
      if (isNaN(formatedIssueDate.getTime())) {
        return {
          result: false,
          messageState: "Fecha de certificacion invalida."
        };
      }
    }

    await Inserts.createCertificate(username, certificateInfo, coverImage);
    return {
      result: true,
      messageState: "Certificado registrado exitosamente."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}