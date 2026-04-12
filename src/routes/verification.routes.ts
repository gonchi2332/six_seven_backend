import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as VerificationController from "../controllers/verification.controller";

const router = Router();

router.patch(
  "/users/verification-code",
  Authorization.tokenAuthorization,
  VerificationController.sendMailVerification
);
router.post(
  "/users/compare-verification-code",
  Authorization.tokenAuthorization,
  VerificationController.compareMailCode
);

export default router;