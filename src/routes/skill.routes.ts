import { Router } from "express";
import * as SkillController from "../controllers/skill.controller";

const router = Router();

/**
 * Ruta para obtener la lista de todas las Hard Skills registradas en el sistema.
 * GET /system/all-hard-skills
 */
router.get(
  "/system/all-hard-skills",
  SkillController.getAllHardSkills
);

/**
 * Ruta para obtener la lista de todas las Soft Skills registradas en el sistema.
 * GET /system/all-soft-skills
 */
router.get(
  "/system/all-soft-skills",
  SkillController.getAllSoftSkills
);

export default router;