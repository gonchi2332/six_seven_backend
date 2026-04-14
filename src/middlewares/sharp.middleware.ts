import { Request, Response, NextFunction } from "express";
import sharp from "sharp";

const standarWidthHeight = 300;

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