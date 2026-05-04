import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as UserSkillController from "../controllers/userskill.controller";

const router = Router();

router.get(
  "/users/hard-skills",
  //Authorization.tokenAuthorization,
  //Authorization.onlyVerifiedUsers,
  UserSkillController.viewHardSkills
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
  "/users/soft-skills",
  UserSkillController.viewSoftSkills
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

export default router;