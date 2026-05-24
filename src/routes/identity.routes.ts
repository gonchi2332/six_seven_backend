import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as IdentityController from "../controllers/identity.controller";

const router = Router();
router.post(
  "/users/select-role",
  Authorization.tokenAuthorization,
  IdentityController.selectRole
);
router.get(
  "/users/role/resources",
  Authorization.tokenAuthorization,
  IdentityController.getCurrentRoleResources
);

export default router;