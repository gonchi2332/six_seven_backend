import { Router } from "express";
import * as SkillController from "../controllers/skill.controller";

const router = Router();

router.get(
  "/system/all-hard-skills",
  SkillController.getAllHardSkills
);

router.get(
  "/system/all-soft-skills",
  SkillController.getAllSoftSkills
);

export default router;