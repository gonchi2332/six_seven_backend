import { Request, Response, NextFunction } from "express";
import { upload } from "../config/multer.config";
import multer from "multer";

export function verifyMulter (err: unknown, req: Request, res: Response, next: NextFunction) {
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

export function checkMulterErrors (req: Request, res: Response, next: NextFunction) {
  upload.single("profilePicture")(req, res, (err) => {
    if (err) {
      return verifyMulter(err, req, res, next);
    }
    next();
  });
}

export function checkProjectImageErrors (req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return verifyMulter(err, req, res, next);
    }
    next();
  });
}

export function checkCertificateCoverImageErrors (req: Request, res: Response, next: NextFunction) {
  upload.single("coverImage")(req, res, (err) => {
    if (err) {
      return verifyMulter(err, req, res, next);
    }
    next();
  });
}