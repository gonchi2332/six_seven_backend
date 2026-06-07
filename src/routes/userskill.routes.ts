import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as UserSkillController from "../controllers/userskill.controller";

const router = Router();

router.get(
  "/users/:username/hard-skills",
  UserSkillController.viewPublicHardSkills
);

router.get(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  UserSkillController.viewPrivateHardSkills
);

router.post(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  UserSkillController.registerHardSkill
);

router.post(
  "/users/new-hard-skill",
  Authorization.tokenAuthorization,
  UserSkillController.registerNewHardSkill
);

router.patch(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  UserSkillController.modifyHardSkill
);

router.delete(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  UserSkillController.deleteHardSkill
);

router.get(
  "/users/:username/soft-skills",
  UserSkillController.viewPublicSoftSkills
);

router.get(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  UserSkillController.viewPrivateSoftSkills
);

router.post(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  UserSkillController.registerSoftSkill
);

router.post(
  "/users/new-soft-skill",
  Authorization.tokenAuthorization,
  UserSkillController.registerNewSoftSkill
);

router.delete(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  UserSkillController.deleteSoftSkill
);

router.patch(
  "/users/skills/visibility",
  Authorization.tokenAuthorization,
  UserSkillController.modifySkillsVisibility
);

export default router;