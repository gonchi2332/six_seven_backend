import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as LaboralExperienceController from "../controllers/laboralexperience.controller";

const router = Router();

/**
 * Ruta para registrar una nueva experiencia laboral para el usuario autenticado.
 * Requiere token de autorización.
 * POST /users/laboral-experience
 */
router.post(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  LaboralExperienceController.registerUserLaboralExperience
);

/**
 * Ruta para modificar una experiencia laboral existente del usuario autenticado.
 * Requiere token de autorización.
 * PATCH /users/laboral-experience
 */
router.patch(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  LaboralExperienceController.modifyUserLaboralExperience
);

/**
 * Ruta para obtener la experiencia laboral pública de un usuario específico.
 * GET /users/:username/laboral-experience
 */
router.get(
  "/users/:username/laboral-experience",
  LaboralExperienceController.viewPublicLaboralExperience
);

/**
 * Ruta para obtener la experiencia laboral (incluyendo privada) del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/laboral-experience
 */
router.get(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  LaboralExperienceController.viewPrivateLaboralExperience
);

/**
 * Ruta para modificar la visibilidad de los registros de experiencia laboral de forma masiva.
 * Requiere token de autorización.
 * PATCH /users/laboral-experience/visibility
 */
router.patch(
  "/users/laboral-experience/visibility",
  Authorization.tokenAuthorization,
  LaboralExperienceController.modifyLaboralExperienceVisibility
);

/**
 * Ruta para eliminar un registro de experiencia laboral del usuario autenticado.
 * Requiere token de autorización.
 * DELETE /users/laboral-experience
 */
router.delete(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  LaboralExperienceController.deleteUserLaboralExperience
);

export default router;