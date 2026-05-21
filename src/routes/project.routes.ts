import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as MulterCheck from "../middlewares/multer.middleware"; 
import * as ProjectController from "../controllers/project.controller";

const router = Router();

router.post(
  "/users/projects",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  MulterCheck.checkProjectImageErrors,
  ProjectController.registerProject
);

router.patch(
  "/users/projects",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  MulterCheck.checkProjectImageErrors,
  ProjectController.modifyProject
);

router.delete(
  "/users/projects",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  ProjectController.deleteProject
);

router.get(
  "/users/:username/projects",
  ProjectController.getPublicProjects
);

router.patch(
  "/users/projects/visibility",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  ProjectController.modifyProjectsVisibility
);

export default router;
