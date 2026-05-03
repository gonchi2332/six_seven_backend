import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as PlatformController from "../controllers/platform.controller";

const router = Router();

router.get(
  "/users/:username/linkedin",
  PlatformController.getLinkedinProfile
);

router.put(
  "/users/linkedin",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  PlatformController.saveLinkedinProfile
);

export default router;
