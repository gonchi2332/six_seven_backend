import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as ProfileController from "../controllers/profile.controller";

const router = Router();

router.get(
  "/users/public-link", 
  Authorization.tokenAuthorization, 
  Authorization.onlyVerifiedUsers,
  ProfileController.getOrCreatePublicLink,
);

router.get(
  "/users",
  ProfileController.getUsersList
);

router.get(
  "/users/:username/sections-visibility",
  ProfileController.viewSectionsVisibility
);

export default router;
