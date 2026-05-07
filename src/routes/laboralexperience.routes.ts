import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as LaboralExperienceController from "../controllers/laboralexperience.controller";

const router = Router();

router.post(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  LaboralExperienceController.registerUserLaboralExperience
);

router.get(
  "/users/laboral-experience",
  LaboralExperienceController.viewUserLaboralExperience
);

router.patch(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  LaboralExperienceController.modifyUserLaboralExperience
);

router.delete(
  "/users/laboral-experience",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  LaboralExperienceController.deleteUserLaboralExperience
);

export default router;