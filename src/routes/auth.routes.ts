import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";

const router = Router();

/**
 * Ruta para registrar la información de credenciales de un nuevo usuario.
 * POST /users/credentials-info
 */
router.post(
  "/users/credentials-info",
  AuthController.registerUser
);

/**
 * Ruta para iniciar sesión de usuario.
 * POST /users/login
 */
router.post(
  "/users/login",
  AuthController.loginUser
);

/**
 * Ruta para restablecer la contraseña del usuario.
 * PATCH /users/reset-password
 */
router.patch(
  "/users/reset-password",
  AuthController.resetPassword
);

/**
 * Ruta para solicitar el restablecimiento de contraseña (olvido de contraseña).
 * POST /users/forgot-password
 */
router.post(
  "/users/forgot-password",
  AuthController.forgotPassword
);

/**
 * Ruta para verificar el código de restablecimiento de contraseña.
 * POST /users/verify-code
 */
router.post(
  "/users/verify-code",
  AuthController.verifyResetCode
);

/**
 * Ruta para renovar el token de acceso mediante un refresh token.
 * POST /refresh
 */
router.post(
  "/refresh",
  AuthController.refreshToken
);

/**
 * Ruta para cerrar sesión de usuario.
 * DELETE /logout
 */
router.delete(
  "/logout",
  AuthController.logout
);

export default router;