import { env } from "../config/env.config";
import nodemailer from "nodemailer";

/*Este fragmento de código crea un objeto `transporter` usando la biblioteca nodemailer en TypeScript
El objeto `transporter` está configurado con los ajustes SMTP necesarios para enviar correos electrónicos. 
Aquí hay un desglose de la configuración: */
export const transporter = nodemailer.createTransport({
  host: env.SEND_EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: env.SEND_EMAIL_USER,
    pass: env.SEND_EMAIL_PASSWORD
  }
});