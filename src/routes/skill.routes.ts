import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as SkillController from "../controllers/skill.controller";

const router = Router();

router.get(
  "/users/hard-skills",
  //Authorization.tokenAuthorization,
  //Authorization.onlyVerifiedUsers,
  SkillController.viewHardSkills
);

router.post(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  SkillController.registerHardSkill
);

router.patch(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  SkillController.modifyHardSkill
);

router.delete(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  SkillController.deleteHardSkill
);

// SOFT SKILLS

router.get(
  "/users/:username/soft-skills",
  SkillController.viewSoftSkills
);

router.post(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  SkillController.registerSoftSkill
);

router.delete(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  SkillController.deleteSoftSkill
);

export default router;
