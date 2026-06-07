import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as EducationController from "../controllers/education.controller";

const router = Router();

router.post(
  "/users/education",
  Authorization.tokenAuthorization,
  EducationController.registerEducation
);

router.patch(
  "/users/education",
  Authorization.tokenAuthorization,
  EducationController.modifyEducation
);

router.delete(
  "/users/education",
  Authorization.tokenAuthorization,
  EducationController.deleteEducation
);

router.get(
  "/users/:username/education",
  EducationController.viewPublicEducation
);

router.get(
  "/education_degree",
  EducationController.viewEducationGrade
);

router.get(
  "/users/education",
  Authorization.tokenAuthorization,
  EducationController.viewPrivateEducation
);

router.patch(
  "/users/education/visibility",
  Authorization.tokenAuthorization,
  EducationController.modifyEducationVisibility
);

export default router;