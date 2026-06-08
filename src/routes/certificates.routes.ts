import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as MulterCheck from "../middlewares/multer.middleware";
import * as CertificatesController from "../controllers/certificate.controller";

const router = Router();

/**
 * Ruta para registrar un nuevo certificado para el usuario autenticado.
 * Requiere token de autorización y maneja la carga de imagen de portada.
 * POST /users/certificates
 */
router.post(
  "/users/certificates",
  Authorization.tokenAuthorization,
  MulterCheck.checkCertificateCoverImageErrors,
  CertificatesController.registerUserCertificate
);

/**
 * Ruta para modificar un certificado existente del usuario autenticado.
 * Requiere token de autorización y maneja la actualización opcional de imagen.
 * PATCH /users/certificates
 */
router.patch(
  "/users/certificates",
  Authorization.tokenAuthorization,
  MulterCheck.checkCertificateCoverImageErrors,
  CertificatesController.modifyUserCertificate
);

/**
 * Ruta para obtener la lista de certificados públicos de un usuario específico.
 * GET /users/:username/certificates
 */
router.get(
  "/users/:username/certificates",
  CertificatesController.viewPublicCertificates
);

/**
 * Ruta para obtener la lista de certificados (incluyendo privados) del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/certificates
 */
router.get(
  "/users/certificates",
  Authorization.tokenAuthorization,
  CertificatesController.viewPrivateCertificates
);

/**
 * Ruta para eliminar un certificado del usuario autenticado.
 * Requiere token de autorización.
 * DELETE /users/certificates
 */
router.delete(
  "/users/certificates",
  Authorization.tokenAuthorization,
  CertificatesController.deleteUserCertificate
);

/**
 * Ruta para modificar la visibilidad de los certificados de forma masiva.
 * Requiere token de autorización.
 * PATCH /users/certificates/visibility
 */
router.patch(
  "/users/certificates/visibility",
  Authorization.tokenAuthorization,
  CertificatesController.modifyCertificatesVisibility
);

export default router;