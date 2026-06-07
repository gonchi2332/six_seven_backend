import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as LaboralExperienceController from "../controllers/laboralexperience.controller";

const router = Router();

router.post(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  LaboralExperienceController.registerUserLaboralExperience
);

router.patch(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  LaboralExperienceController.modifyUserLaboralExperience
);

router.get(
  "/users/:username/laboral-experience",
  LaboralExperienceController.viewPublicLaboralExperience
);

router.get(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  LaboralExperienceController.viewPrivateLaboralExperience
);

router.patch(
  "/users/laboral-experience/visibility",
  Authorization.tokenAuthorization,
  LaboralExperienceController.modifyLaboralExperienceVisibility
);

router.delete(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  LaboralExperienceController.deleteUserLaboralExperience
);

export default router;