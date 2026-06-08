import { Request, Response, NextFunction } from "express";
import sharp from "sharp";

const standarWidthHeight = 300;

/**
 * Middleware `verifyProfilePictureDimensions` que procesa y valida la imagen de perfil cargada.
 * Utiliza la librería `sharp` para:
 * 1. Verificar que el formato sea PNG o JPEG.
 * 2. Asegurar que la imagen tenga dimensiones válidas.
 * 3. Redimensionar la imagen a un tamaño estándar (300x300 px) y convertirla a JPEG con calidad optimizada.
 * El buffer procesado reemplaza al original en `req.file.buffer`.
 * @param {Request} req - Objeto de solicitud que contiene el archivo en `req.file`.
 * @param {Response} res - Objeto de respuesta.
 * @param {NextFunction} next - Función para continuar.
 * @returns Respuesta 400 si el formato es inválido o ocurre un error en el procesamiento.
 */
export async function verifyProfilePictureDimensions(req: Request, res: Response, next: NextFunction) {
  const profilePicture = req.file;
  try {
    if (!profilePicture) return next();

    const metadata = await sharp(profilePicture.buffer).metadata();

    if (!metadata.format || !["png", "jpeg"].includes(metadata.format)) {
      return res.status(400).json({
        success: false,
        message: "Imagen invalida, formato no permitido."
      });
    }
    if (!metadata.height || !metadata.width) {
      return res.status(400).json({
        success: false,
        message: "Imagen invalida, sin dimensiones."
      });
    }

    const processedProfilePicture = await sharp(profilePicture.buffer)
      .resize(standarWidthHeight, standarWidthHeight)
      .jpeg({ quality: 80 })
      .toBuffer();
    profilePicture.buffer = processedProfilePicture;
    return next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Error en el procesamiento de la imagen de perfil: ${(err as Error).message}`
    });
  }
}