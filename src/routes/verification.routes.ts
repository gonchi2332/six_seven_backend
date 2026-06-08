import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as VerificationController from "../controllers/verification.controller";

const router = Router();

/**
 * Ruta para obtener el correo electrónico de registro del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/mail
 */
router.get(
  "/users/mail",
  Authorization.tokenAuthorization,
  VerificationController.getUserMail
);

/**
 * Ruta para solicitar el envío de un código de verificación al correo del usuario.
 * Requiere token de autorización.
 * POST /users/verification-code
 */
router.post(
  "/users/verification-code",
  Authorization.tokenAuthorization,
  VerificationController.sendMailVerification
);

/**
 * Ruta para comparar y validar el código de verificación ingresado por el usuario.
 * Requiere token de autorización.
 * PATCH /users/compare-verification-code
 */
router.patch(
  "/users/compare-verification-code",
  Authorization.tokenAuthorization,
  VerificationController.compareMailCode
);

export default router;