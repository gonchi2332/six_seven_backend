import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as MulterCheck from "../middlewares/multer.middleware";
import * as SharpCheck from "../middlewares/sharp.middleware";
import * as RegisterPersonalInfoController from "../controllers/register.controller";

const router = Router();

/**
 * Ruta para registrar la información personal inicial del usuario autenticado.
 * Requiere token de autorización, maneja carga de imagen de perfil y validación de dimensiones.
 * POST /users/personal-info
 */
router.post(
  "/users/personal-info",
  Authorization.tokenAuthorization,
  MulterCheck.checkMulterErrors,
  SharpCheck.verifyProfilePictureDimensions,
  RegisterPersonalInfoController.registerPersonalInfo,
);

/**
 * Ruta para actualizar la información personal del usuario autenticado.
 * Requiere token de autorización, maneja carga opcional de imagen de perfil y validación de dimensiones.
 * PUT /users/personal-info
 */
router.put(
  "/users/personal-info",
  Authorization.tokenAuthorization,
  MulterCheck.checkMulterErrors,
  SharpCheck.verifyProfilePictureDimensions,
  RegisterPersonalInfoController.updatePersonalInfo,
);

/**
 * Ruta para obtener la información personal pública de un usuario específico.
 * GET /users/:username/personal-info
 */
router.get(
  "/users/:username/personal-info",
  RegisterPersonalInfoController.viewPublicPersonalInfo
);

/**
 * Ruta para obtener la información personal (incluyendo privada) del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/personal-info
 */
router.get(
  "/users/personal-info",
  Authorization.tokenAuthorization,
  RegisterPersonalInfoController.viewPrivatePersonalInfo
);

/**
 * Ruta para modificar la visibilidad de los campos de información personal de forma masiva.
 * Requiere token de autorización.
 * PATCH /users/personal-info/visibility
 */
router.patch(
  "/users/personal-info/visibility",
  Authorization.tokenAuthorization,
  RegisterPersonalInfoController.modifyPersonalInfoVisibility
);

export default router;