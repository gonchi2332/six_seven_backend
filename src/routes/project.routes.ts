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

export default router;
