import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as VerificationController from "../controllers/verification.controller";

const router = Router();

router.post(
  "/users/verification-code",
  Authorization.tokenAuthorization,
  VerificationController.sendMailVerification
);
router.patch(
  "/users/compare-verification-code",
  Authorization.tokenAuthorization,
  VerificationController.compareMailCode
);

export default router;