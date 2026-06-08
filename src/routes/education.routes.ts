import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as EducationController from "../controllers/education.controller";

const router = Router();

/**
 * Ruta para registrar un nuevo registro de educación para el usuario autenticado.
 * Requiere token de autorización.
 * POST /users/education
 */
router.post(
  "/users/education",
  Authorization.tokenAuthorization,
  EducationController.registerEducation
);

/**
 * Ruta para modificar un registro de educación existente del usuario autenticado.
 * Requiere token de autorización.
 * PATCH /users/education
 */
router.patch(
  "/users/education",
  Authorization.tokenAuthorization,
  EducationController.modifyEducation
);

/**
 * Ruta para eliminar un registro de educación del usuario autenticado.
 * Requiere token de autorización.
 * DELETE /users/education
 */
router.delete(
  "/users/education",
  Authorization.tokenAuthorization,
  EducationController.deleteEducation
);

/**
 * Ruta para obtener la formación académica pública de un usuario específico.
 * GET /users/:username/education
 */
router.get(
  "/users/:username/education",
  EducationController.viewPublicEducation
);

/**
 * Ruta para obtener el catálogo de grados académicos disponibles en el sistema.
 * GET /education_degree
 */
router.get(
  "/education_degree",
  EducationController.viewEducationGrade
);

/**
 * Ruta para obtener la formación académica (incluyendo privada) del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/education
 */
router.get(
  "/users/education",
  Authorization.tokenAuthorization,
  EducationController.viewPrivateEducation
);

/**
 * Ruta para modificar la visibilidad de los registros de educación de forma masiva.
 * Requiere token de autorización.
 * PATCH /users/education/visibility
 */
router.patch(
  "/users/education/visibility",
  Authorization.tokenAuthorization,
  EducationController.modifyEducationVisibility
);

export default router;