import { transporter } from "../config/nodemailer.config";
import { env } from "../config/env.config";

export async function sendResetCodeEmail(to: string, code: string) {
  const mailOptions = {
    from: `"Equipo Six Seven" <${env.SEND_EMAIL_USER}>`,
    to,
    subject: "Código de Recuperación de Contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; color: #333;">
        <h2>Recuperación de Contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Tu código de verificación de 8 dígitos es:</p>
        <div style="background-color: #2a6f78; color: white; padding: 15px 25px; border-radius: 8px; display: inline-block; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p style="margin-top: 20px; color: #666;">Este código expirará en 1 hora.</p>
        <p style="color: #666; font-size: 12px;">Si no solicitaste este cambio, ignora este correo.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
