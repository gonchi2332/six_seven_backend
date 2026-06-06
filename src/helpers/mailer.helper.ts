import * as fs from "fs";
import * as path from "path";
import { transporter } from "../config/nodemailer.config";
import { env } from "../config/env.config";

export async function sendResetCodeEmail(to: string, username: string, code: string) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width">
        <title>Recuperación de Contraseña</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Nunito:wght@500;700&display=swap" rel="stylesheet">
        <style>
            body { margin: 0; padding: 0; width: 100%; font-family: "Nunito", sans-serif; background: #f4f4f4; }
            p { font-weight: 500; font-size: 1rem; color: #07393C; margin: 20px 0; }
            .headBar { background-color: #2C666E; padding: 15px; width: 100%; box-sizing: border-box; }
            .content { background-color: #b1e5f2; width: 100%; min-height: 250px; box-sizing: border-box; padding: 10px 20px; }
            .title { color: #ffffff; text-align: center; margin: 10px 0; font-weight: 700; font-family: "Inter", sans-serif; font-size: 1.5rem; }
            .subtitle { color: #07393C; text-align: left; margin: 20px 0; font-weight: 700; }
            .code { color: #07393C; text-align: center; margin: 30px 0; width: 100%; font-weight: 700; font-size: 32px; letter-spacing: 5px; background: rgba(255,255,255,0.3); padding: 10px; border-radius: 8px; }
            .footer { color: #666; font-size: 12px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <header>
            <div class="headBar">
                <h1 class="title">Código de Recuperación de Constraseña</h1>
            </div>
        </header>
        <main>
            <div class="content">
                <h2 class="subtitle">Restablecer Contraseña</h2>
                <p>Hola <strong>${username}</strong>,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña en la plataforma <strong>Six Seven</strong>.</p>
                <p>Para continuar, ingresa el siguiente código de verificación enviado a este correo:</p>
                <div class="code">
                    ${code}
                </div>
                <p class="footer">Este código expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            </div>
        </main>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Equipo Six Seven" <${env.SEND_EMAIL_USER}>`,
    to,
    subject: "Código de Recuperación de Contraseña - Six Seven",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
}

export function generateHTMLMail(username: string, targetMail: string, code: string) {
  let htmlMail : string = fs.readFileSync(path.join(__dirname, "./mail.html"), "utf-8"); 

  htmlMail = htmlMail.replace("__USERNAME__", username);
  htmlMail = htmlMail.replace(/__TARGETMAIL__/g, targetMail);
  htmlMail = htmlMail.replace("__CODE__", code);

  return htmlMail;
}