import { env } from "../config/env.config";
import { transporter } from "../config/nodemailer.config";
import { generateCode } from "../utils/generate";
import { generateHTMLMail } from "../helpers/mailer.helper";
import { processReturnQuery } from "../utils/query";
import * as TokenTypes from "../types/token.types";

export async function getUserMail(username: string) {
  try {
    const checkQuery = `
      SELECT username FROM "user"
      WHERE username = $1
    `;
    const foundUsers = await processReturnQuery(checkQuery, [username]);
    if (foundUsers.length === 0) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const emailQuery = `
      SELECT main_registration_email FROM "user"
      WHERE username = $1
    `;
    const emailRes = await processReturnQuery(emailQuery, [username]);
    const targetMail = emailRes[0].main_registration_email;
    return {
      result: true,
      messageState: "Correo electronico del usuario recuperado.",
      email: targetMail
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function sendMailVerificationCode(username: string) {
  try {
    let checkQuery = `
      SELECT username FROM "user"
      WHERE username = $1
    `;
    const foundedUsers = await processReturnQuery(checkQuery, [username]);
    if (foundedUsers.length === 0) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    checkQuery = `
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
      const currentCode = currentCodeInfo.code;
      insertQuery = `
        UPDATE "verification_mail_code"
        SET expires_at = now() - interval '1 hour'
        WHERE username = $1 AND code = $2
      `;
      values = [username, currentCode];
      await processReturnQuery(insertQuery, values);
      code = generateCode();
      insertQuery = `
        INSERT INTO "verification_mail_code" (username, code)
        VALUES ($1, $2)
      `;
      values = [username, code];
      await processReturnQuery(insertQuery, values);
    }

    const emailQuery = `
      SELECT main_registration_email FROM "user"
      WHERE username = $1
    `;
    const emailRes = await processReturnQuery(emailQuery, [username]);
    const targetMail = emailRes[0].main_registration_email;
    const targetMails = [targetMail];

    const secondaryEmailQuery = `
      SELECT registration_email FROM "user_registration_email"
      WHERE username = $1
    `;
    const secondaryRegistrationEmail = await processReturnQuery(secondaryEmailQuery, [username]);
    if (secondaryRegistrationEmail.length === 1) {
      const secondaryTargetMail = secondaryRegistrationEmail[0].registration_email;
      targetMails.push(secondaryTargetMail);
    }

    await transporter.sendMail({
      from: env.SEND_USER + " <no-reply@" + env.SEND_EMAIL_USER + ">",
      to: targetMails.join(","),
      subject: "Verificacion de cuenta nueva - Portafolio Web",
      html: generateHTMLMail(username, targetMail, code)
    });
    return {
      result: true,
      messageState: "Codigo de verificacion enviado.",
      email: targetMail
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
    let checkQuery = `
      SELECT username FROM "user"
      WHERE username = $1
    `;
    const foundedUsers = await processReturnQuery(checkQuery, [username]);
    if (foundedUsers.length === 0) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    checkQuery = `
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