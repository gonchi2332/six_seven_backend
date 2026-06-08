import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as PlatformController from "../controllers/platform.controller";

const router = Router();

/**
 * Ruta para obtener el perfil de LinkedIn de un usuario específico.
 * GET /users/:username/linkedin
 */
router.get(
  "/users/:username/linkedin",
  PlatformController.getLinkedinProfile
);

/**
 * Ruta para obtener el perfil de GitHub de un usuario específico.
 * GET /users/:username/github
 */
router.get(
  "/users/:username/github",
  PlatformController.getGithubProfile
);

/**
 * Ruta para guardar o actualizar el perfil de LinkedIn del usuario autenticado.
 * Requiere token de autorización.
 * PUT /users/linkedin
 */
router.put(
  "/users/linkedin",
  Authorization.tokenAuthorization,
  PlatformController.saveLinkedinProfile
);

/**
 * Ruta para guardar o actualizar el perfil de GitHub del usuario autenticado.
 * Requiere token de autorización.
 * PUT /users/github
 */
router.put(
  "/users/github",
  Authorization.tokenAuthorization,
  PlatformController.saveGithubProfile
);

export default router;