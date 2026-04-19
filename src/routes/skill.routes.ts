import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as SkillController from "../controllers/skill.controller";

const router = Router();

router.get(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  SkillController.viewHardSkills
);

export default router;