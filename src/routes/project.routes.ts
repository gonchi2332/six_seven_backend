import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as MulterCheck from "../middlewares/multer.middleware";
import * as ProjectController from "../controllers/project.controller";

const router = Router();

/**
 * Ruta para registrar un nuevo proyecto para el usuario autenticado.
 * Requiere token de autorización y maneja la carga de imagen del proyecto.
 * POST /users/projects
 */
router.post(
  "/users/projects",
  Authorization.tokenAuthorization,
  MulterCheck.checkProjectImageErrors,
  ProjectController.registerProject
);

/**
 * Ruta para modificar un proyecto existente del usuario autenticado.
 * Requiere token de autorización y maneja la actualización opcional de imagen.
 * PATCH /users/projects
 */
router.patch(
  "/users/projects",
  Authorization.tokenAuthorization,
  MulterCheck.checkProjectImageErrors,
  ProjectController.modifyProject
);

/**
 * Ruta para eliminar un proyecto del usuario autenticado.
 * Requiere token de autorización.
 * DELETE /users/projects
 */
router.delete(
  "/users/projects",
  Authorization.tokenAuthorization,
  ProjectController.deleteProject
);

/**
 * Ruta para obtener la lista de proyectos públicos de un usuario específico.
 * GET /users/:username/projects
 */
router.get(
  "/users/:username/projects",
  ProjectController.getPublicProjects
);

/**
 * Ruta para obtener la lista de proyectos (incluyendo privados) del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/projects
 */
router.get(
  "/users/projects",
  Authorization.tokenAuthorization,
  ProjectController.getPrivateProjects
);

/**
 * Ruta para modificar la visibilidad de los proyectos de forma masiva.
 * Requiere token de autorización.
 * PATCH /users/projects/visibility
 */
router.patch(
  "/users/projects/visibility",
  Authorization.tokenAuthorization,
  ProjectController.modifyProjectsVisibility
);

export default router;