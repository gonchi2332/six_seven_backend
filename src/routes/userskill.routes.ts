import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as UserSkillController from "../controllers/userskill.controller";

const router = Router();

/**
 * Ruta para obtener las Hard Skills públicas de un usuario específico.
 * GET /users/:username/hard-skills
 */
router.get(
  "/users/:username/hard-skills",
  UserSkillController.viewPublicHardSkills
);

/**
 * Ruta para obtener las Hard Skills (incluyendo privadas) del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/hard-skills
 */
router.get(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  UserSkillController.viewPrivateHardSkills
);

/**
 * Ruta para asociar una Hard Skill existente al usuario autenticado.
 * Requiere token de autorización.
 * POST /users/hard-skills
 */
router.post(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  UserSkillController.registerHardSkill
);

/**
 * Ruta para registrar una nueva Hard Skill en el sistema y asociarla al usuario.
 * Requiere token de autorización.
 * POST /users/new-hard-skill
 */
router.post(
  "/users/new-hard-skill",
  Authorization.tokenAuthorization,
  UserSkillController.registerNewHardSkill
);

/**
 * Ruta para modificar la puntuación de una Hard Skill del usuario autenticado.
 * Requiere token de autorización.
 * PATCH /users/hard-skills
 */
router.patch(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  UserSkillController.modifyHardSkill
);

/**
 * Ruta para eliminar una Hard Skill del usuario autenticado.
 * Requiere token de autorización.
 * DELETE /users/hard-skills
 */
router.delete(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  UserSkillController.deleteHardSkill
);

/**
 * Ruta para obtener las Soft Skills públicas de un usuario específico.
 * GET /users/:username/soft-skills
 */
router.get(
  "/users/:username/soft-skills",
  UserSkillController.viewPublicSoftSkills
);

/**
 * Ruta para obtener las Soft Skills (incluyendo privadas) del usuario autenticado.
 * Requiere token de autorización.
 * GET /users/soft-skills
 */
router.get(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  UserSkillController.viewPrivateSoftSkills
);

/**
 * Ruta para asociar una Soft Skill existente al usuario autenticado.
 * Requiere token de autorización.
 * POST /users/soft-skills
 */
router.post(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  UserSkillController.registerSoftSkill
);

/**
 * Ruta para registrar una nueva Soft Skill en el sistema y asociarla al usuario.
 * Requiere token de autorización.
 * POST /users/new-soft-skill
 */
router.post(
  "/users/new-soft-skill",
  Authorization.tokenAuthorization,
  UserSkillController.registerNewSoftSkill
);

/**
 * Ruta para eliminar una Soft Skill del usuario autenticado.
 * Requiere token de autorización.
 * DELETE /users/soft-skills
 */
router.delete(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  UserSkillController.deleteSoftSkill
);

/**
 * Ruta para modificar la visibilidad de las habilidades de forma masiva.
 * Requiere token de autorización.
 * PATCH /users/skills/visibility
 */
router.patch(
  "/users/skills/visibility",
  Authorization.tokenAuthorization,
  UserSkillController.modifySkillsVisibility
);

export default router;