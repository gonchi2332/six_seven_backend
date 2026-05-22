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
  Authorization.onlyVerifiedUsers,
  UserSkillController.viewPrivateHardSkills
);

router.post(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.registerHardSkill
);

router.post(
  "/users/new-hard-skill",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.registerNewHardSkill
);

router.patch(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.modifyHardSkill
);

router.delete(
  "/users/hard-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.deleteHardSkill
);

// SOFT SKILLS
router.get(
  "/users/:username/soft-skills",
  UserSkillController.viewPublicSoftSkills
);

router.get(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.viewPrivateSoftSkills
);

router.post(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.registerSoftSkill
);

router.post(
  "/users/new-soft-skill",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.registerNewSoftSkill
);

router.delete(
  "/users/soft-skills",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.deleteSoftSkill
);

router.patch(
  "/users/skills/visibility",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  UserSkillController.modifySkillsVisibility
);

export default router;
