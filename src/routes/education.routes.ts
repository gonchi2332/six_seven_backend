import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as EducationController from "../controllers/education.controller";

const router = Router();

router.post(
  "/users/education",
  Authorization.tokenAuthorization,
  //Authorization.onlyVerifiedUsers,
  EducationController.registerEducation
);

router.patch(
  "/users/education",
  Authorization.tokenAuthorization,
  //Authorization.onlyVerifiedUsers,
  EducationController.modifyEducation
);

router.delete(
  "/users/education",
  Authorization.tokenAuthorization,
  //Authorization.onlyVerifiedUsers,
  EducationController.deleteEducation
);

router.get(
  "/users/education",
  EducationController.viewEducation
);

router.get(
  "/education_degree",
  EducationController.viewEducationGrade
);

export default router;
