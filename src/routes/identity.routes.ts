import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as IdentityController from "../controllers/identity.controller";

const router = Router();
router.post(
  "/users/select-role",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  IdentityController.selectRole
);

router.get(
  "/users/role/resources",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  IdentityController.getCurrentRoleResources
);

export default router;