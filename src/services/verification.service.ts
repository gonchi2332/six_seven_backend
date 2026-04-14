import { env } from "../config/env.config";
import { transporter } from "../config/nodemailer.config";
import { generateCode, generateHTMLMail } from "../utils/generate";
import { processReturnQuery } from "../utils/processQuery";
import * as TokenTypes from "../types/token.types";

export async function sendMailVerificationCode(username: string, targetMail: string) {
  try {
    const checkQuery = `
      SELECT * FROM "verification_mail_code"
      WHERE username = $1 AND expires_at > now()
    `;
    let values = [username];
    const codeInfo = await processReturnQuery(checkQuery, values);
    let code;
    let insertQuery;
    if (codeInfo.length === 0) {
      code = generateCode();
      insertQuery = `
        INSERT INTO "verification_mail_code" (username, code)
        VALUES ($1, $2)
      `;
      values = [username, code];
      await processReturnQuery(insertQuery, values);
    } else {
      const currentCodeInfo = codeInfo[0];
      code = currentCodeInfo.code;
    }

    await transporter.sendMail({
      from: env.SEND_USER + " <no-reply:" + env.SEND_EMAIL_USER + ">",
      to: targetMail,
      subject: "Verificacion de cuenta nueva - Portafolio Web",
      html: generateHTMLMail(username, targetMail, code)
    });
    return {
      result: true,
      messageState: "Codigo de verificacion enviado."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function compareVerificationMailCodes(username: string, currentCode: string) {
  try {
    const checkQuery = `
      SELECT * FROM "verification_mail_code"
      WHERE username = $1 AND expires_at > now()
    `;
    let values = [username];
    const codeInfo = await processReturnQuery(checkQuery, values);
    if (codeInfo.length === 0) {
      return {
        result: false,
        messageState: "No se ha enviado ningun codigo de verificacion aun."
      };
    } 

    const currentCodeInfo = codeInfo[0];
    const code = currentCodeInfo.code;
    if (currentCode !== code) {
      return {
        result: false,
        messageState: "El codigo de verificacion introducido no coincide con el codigo enviado."
      };
    }
    const updateQuery = `
      UPDATE "user"
      SET state = $1
      WHERE username = $2
    `;
    values = [TokenTypes.VerificationState.VERIFIED, username];
    await processReturnQuery(updateQuery, values);
    return {
      result: true,
      messageState: "Verificacion correcta, codigos de verificacion coincidentes."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}