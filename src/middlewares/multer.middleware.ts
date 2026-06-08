import { Request, Response, NextFunction } from "express";
import { upload } from "../config/multer.config";
import multer from "multer";

/**
 * Middleware `verifyMulter` que procesa errores generados por Multer durante la carga de archivos.
 * Diferencia entre errores específicos de Multer (como tamaño excedido) y otros errores generales.
 * @param {unknown} err - Error capturado por Express.
 * @param {Request} req - Objeto de solicitud.
 * @param {Response} res - Objeto de respuesta.
 * @param {NextFunction} next - Función para continuar si no hay error.
 * @returns Respuesta 400 con el mensaje de error si existe un problema con el archivo.
 */
export function verifyMulter(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Error de archivo (multer): ${(err as Error).message}`
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: `Error de archivo: ${(err as Error).message}`
    });
  }
  next();
}

/**
 * Middleware `checkMulterErrors` que gestiona la carga de una única imagen de perfil (`profilePicture`).
 * Utiliza la configuración de `upload` y delega el manejo de errores a `verifyMulter`.
 * @param {Request} req - Objeto de solicitud.
 * @param {Response} res - Objeto de respuesta.
 * @param {NextFunction} next - Función para continuar.
 */
export function checkMulterErrors(req: Request, res: Response, next: NextFunction) {
  upload.single("profilePicture")(req, res, (err) => {
    if (err) {
      return verifyMulter(err, req, res, next);
    }
    next();
  });
}

/**
 * Middleware `checkProjectImageErrors` que gestiona la carga de una imagen de proyecto (`image`).
 * @param {Request} req - Objeto de solicitud.
 * @param {Response} res - Objeto de respuesta.
 * @param {NextFunction} next - Función para continuar.
 */
export function checkProjectImageErrors(req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return verifyMulter(err, req, res, next);
    }
    next();
  });
}

/**
 * Middleware `checkCertificateCoverImageErrors` que gestiona la carga de una imagen de portada de certificado (`coverImage`).
 * @param {Request} req - Objeto de solicitud.
 * @param {Response} res - Objeto de respuesta.
 * @param {NextFunction} next - Función para continuar.
 */
export function checkCertificateCoverImageErrors(req: Request, res: Response, next: NextFunction) {
  upload.single("coverImage")(req, res, (err) => {
    if (err) {
      return verifyMulter(err, req, res, next);
    }
    next();
  });
}