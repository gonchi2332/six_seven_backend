import { generateCode } from "../utils/generate.util";
import { sendVerificationCode } from "../helpers/nodemailer.helper";
import * as TokenTypes from "../types/token.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as VerificationRepository from "../repositories/verification.repository";

export async function getUserMail(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const foundUsers = await CommonRepository.findByUsername(username);
    if (foundUsers.length === 0) {
      return { result: false, messageState: "El usuario no existe." };
    }

    const emailRes = await VerificationRepository.getUserRegistrationEmail(username);
    const targetMail = emailRes.main_registration_email;
    return { result: true, messageState: "Correo electronico del usuario recuperado.", email: targetMail };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function sendMailVerificationCode(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const foundedUsers = await CommonRepository.findByUsername(username);
    if (foundedUsers.length === 0) {
      return { result: false, messageState: "El usuario no existe." };
    }

    const codeInfo = await VerificationRepository.getCurrentVerificationMailCode(username);
    let code;
    if (codeInfo.length === 0) {
      code = generateCode();
      await VerificationRepository.insertVerificationMailCode(username, code);
    } else {
      const currentCodeInfo = codeInfo[0];
      const currentCode = currentCodeInfo.code;
      await VerificationRepository.forceExplirationCode(username, currentCode);
      code = generateCode();
      await VerificationRepository.insertVerificationMailCode(username, code);
    }

    const emailRes = await VerificationRepository.getUserRegistrationEmail(username);
    const targetMail = emailRes.main_registration_email;
    const targetMails = [targetMail];

    const secondaryRegistrationEmail = await VerificationRepository.getUserSecondaryEmail(username);
    if (secondaryRegistrationEmail.length === 1) {
      const secondaryTargetMail = secondaryRegistrationEmail.registration_email;
      targetMails.push(secondaryTargetMail);
    }

    await sendVerificationCode(username, targetMails, targetMail, code);
    return { result: true, messageState: "Codigo de verificacion enviado.", email: targetMail };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function compareVerificationMailCodes(
  tokenInfo: TokenTypes.TokenPayload,
  compareCodesInfo: any) {
  try {
    const { username } = tokenInfo;
    const { currentCode } = compareCodesInfo;

    const foundedUsers = await CommonRepository.findByUsername(username);
    if (foundedUsers.length === 0) {
      return { result: false, messageState: "El usuario no existe." };
    }

    const codeInfo = await VerificationRepository.getCurrentVerificationMailCode(username);
    if (codeInfo.length === 0) {
      return { result: false, messageState: "No se ha enviado ningun codigo de verificacion aun." };
    } 

    const currentCodeInfo = codeInfo[0];
    const code = currentCodeInfo.code;
    if (currentCode !== code) {
      return {
        result: false,
        messageState: "El codigo de verificacion introducido no coincide con el codigo enviado."
      };
    }
    await VerificationRepository.updateVerificationCode(username);
    return { result: true, messageState: `Verificacion de ${username} completada con exito` };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}