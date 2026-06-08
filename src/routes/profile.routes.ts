import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as ProfileController from "../controllers/profile.controller";

const router = Router();

/**
 * Ruta para obtener o generar el enlace público del perfil del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/public-link
 */
router.get(
  "/users/public-link",
  Authorization.tokenAuthorization,
  ProfileController.getOrCreatePublicLink,
);

/**
 * Ruta para obtener la lista general de usuarios registrados en el sistema.
 * GET /users
 */
router.get(
  "/users",
  ProfileController.getUsersList
);

/**
 * Ruta para obtener la configuración de visibilidad de las secciones del perfil de un usuario.
 * GET /users/:username/sections-visibility
 */
router.get(
  "/users/:username/sections-visibility",
  ProfileController.viewSectionsVisibility
);

export default router;