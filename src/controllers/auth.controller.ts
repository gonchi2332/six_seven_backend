import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as AuthValidations from "../validators/auth.validator";
import * as AuthService from "../services/auth.service";

export async function registerUser(req: Request, res: Response) {
  try {
    const validations = AuthValidations.registerUserValidations(req.body);
    if (!validations.result) {
      return res.status(400).json({ error: validations.messageState });
    }

    const response = await AuthService.registerUserService(req.body);
    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: response.user,
      token: response.token
    });
  } catch (error) {
    if ((error as Error).name === "ConflictError") {
      return res.status(409).json({ error: (error as Error).message });
    }
    return res.status(500).json({
      message: `Error en registerUser: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const validations = AuthValidations.loginUserValidation(req.body);
    if (!validations.result) {
      if (!validations.result) {
        return res.status(400).json({ error: validations.messageState });
      }
    }

    const response = await AuthService.login(req.body);
    return res.status(200).json({
      success: true,
      message: `Inicio de sesion exitoso del usuario ${req.body.username}`,
      user: response.user,
      profilePicture: response.profilePicture,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    });

  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return res.status(401).json({ error: (error as Error).message });
    }
    return res.status(500).json({
      message: `Error en loginUser: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const validations = AuthValidations.resetPasswordValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ error: validations.messageState });
    }

    await AuthService.resetPassword(req.body);
    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return res.status(401).json({ error: (error as Error).message });
    }
    if ((error as Error).name === "ConflictError") {
      return res.status(409).json({ error: (error as Error).message });
    }
    return res.status(500).json({
      message: `Error en resetPassword: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const validations = AuthValidations.forgotPasswordValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await AuthService.forgotPasswordService(req.body);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: "Contraseña recuperada.",
      verificationMails: response.emails
    });

  } catch (err) {
    if ((err as Error).name === "NotFoundError") {
      return res.status(404).json({
        success: false,
        message: `Contraseña no recuoerada: ${(err as Error).message}`
      });
    }
    return res.status(500).json({
      success: false,
      message: `Error en forgotPassword: ${(err as Error).message}`,
    });
  }
}

export async function verifyResetCode(req: Request, res: Response) {
  try {
    const validations = AuthValidations.verifyResetCodeValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const isValid = await AuthService.verifyCodeService(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Código inválido o expirado." });
    }
    return res.status(200).json({ success: true, message: "Código verificado correctamente." });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const validations = AuthValidations.refreshTokenValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const result = await AuthService.refreshSession(req.body);
    return res.status(200).json({ success: true, accessToken: result.accessToken });

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError || (err as Error).message === "INVALID_REFRESH_TOKEN") {
      return res.status(403).json({
        success: false,
        message: "Refresh token inválido o expirado. Debe iniciar sesión de nuevo"
      });
    }
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const validations = AuthValidations.logoutValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    await AuthService.logoutSession(req.body);
    return res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente en el servidor."
    });

  } catch (err) {
    if ((err as Error).message === "TOKEN_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "El token no existe o ya fue eliminado" });
    }
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}