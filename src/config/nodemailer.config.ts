import { env } from "../config/env.config";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: env.SEND_EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: env.SEND_EMAIL_USER,
    pass: env.SEND_EMAIL_PASSWORD
  }
});