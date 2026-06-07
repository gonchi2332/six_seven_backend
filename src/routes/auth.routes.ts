import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";

const router = Router();

router.post(
  "/users/credentials-info",
  AuthController.registerUser
);

router.post(
  "/users/login",
  AuthController.loginUser
);

router.patch(
  "/users/reset-password",
  AuthController.resetPassword
);

router.post(
  "/users/forgot-password",
  AuthController.forgotPassword
);

router.post(
  "/users/verify-code",
  AuthController.verifyResetCode
);

router.post(
  "/refresh",
  AuthController.refreshToken
);

router.delete(
  "/logout",
  AuthController.logout
);

export default router;