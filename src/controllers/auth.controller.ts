import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as AuthService from "../services/auth.service";

export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, names, firstSurname, secondSurname, mainRegistrationEmail } = req.body;

    if (!username || typeof username !== "string" ||
      !password || typeof password !== "string" ||
      !names || typeof names !== "string" ||
      !firstSurname || typeof firstSurname !== "string" ||
      !mainRegistrationEmail || typeof mainRegistrationEmail !== "string") {
      res.status(400).json({ error: "Faltan campos obligatorios." });
      return;
    }
    if (secondSurname !== undefined && typeof secondSurname !== "string") {
      res.status(400).json({ error: "El segundo apellido debe ser un texto válido." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mainRegistrationEmail)) {
      res.status(400).json({ error: "Formato de correo electronico invalido." });
      return;
    }

    await AuthService.registerUserService(username, password, names, firstSurname, secondSurname, mainRegistrationEmail);

    res.status(201).json({
      message: "Usuario registrado correctamente"
    });

  } catch (error) {
    if ((error as Error).name === "ConflictError") {
      res.status(409).json({ error: (error as Error).message });
      return;
    }
    res.status(500).json({
      message: `Error en registerUser: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== "string" ||
      !password || typeof password !== "string") {
      res.status(400).json({ error: "Faltan campos obligatorios." });
      return;
    }

    const { user, profilePicture, accessToken, refreshToken } = await AuthService.login(username, password);

    res.status(200).json({
      success: true,
      message: `Inicio de sesion exitoso del usuario ${username}`,
      user,
      profilePicture,
      accessToken,
      refreshToken
    });

  } catch (error) {
    if ((error as Error).name === "AuthError") {
      res.status(401).json({ error: (error as Error).message });
      return;
    }
    res.status(500).json({
      message: `Error en loginUser: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, verificationCode } = req.body;

    if (!username || typeof username !== "string" ||
      !password || typeof password !== "string" ||
      !verificationCode || typeof verificationCode !== "string") {
      res.status(400).json({ error: "Faltan campos obligatorios." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    await AuthService.resetPassword(username, password, verificationCode);

    res.status(200).json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    if ((error as Error).name === "AuthError") {
      res.status(401).json({ error: (error as Error).message });
      return;
    }
    if ((error as Error).name === "ConflictError") {
      res.status(409).json({ error: (error as Error).message });
      return;
    }
    res.status(500).json({
      message: `Error en resetPassword: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.query;

    if (!username || typeof username !== "string") {
      res.status(400).json({
        success: false,
        message: "El nombre de usuario es obligatorio."
      });
      return;
    }

    const { result, messageState, emails } = await AuthService.forgotPasswordService(username);
    if (!result) {
      res.status(400).json({
        success: false,
        message: messageState,
      });
    }
    res.status(200).json({
      success: true,
      message: "Contraseña recuperada.",
      verificationMails: emails
    });

  } catch (err) {
    if ((err as Error).name === "NotFoundError") {
      res.status(404).json({
        success: false,
        message: `Contraseña no recuoerada: ${(err as Error).message}`
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: `Error en forgotPassword: ${(err as Error).message}`,
    });
  }
}

export async function verifyResetCode(req: Request, res: Response): Promise<void> {
  try {
    const { username, code } = req.body;

    if (!username || !code) {
      res.status(400).json({ success: false, message: "Usuario y código son obligatorios." });
      return;
    }

    const isValid = await AuthService.verifyCodeService(username, code);

    if (!isValid) {
      res.status(400).json({ success: false, message: "Código inválido o expirado." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Código verificado correctamente."
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El campo refreshToken faltante o invalido'
      });
    }

    const result = await AuthService.refreshSession(refreshToken);
    return res.status(200).json({
      success: true,
      accessToken: result.accessToken
    });

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError || (err as Error).message === 'INVALID_REFRESH_TOKEN') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token inválido o expirado. Debe iniciar sesión de nuevo'
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
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token requerido.' });
    }

    await AuthService.logoutSession(refreshToken);
    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente en el servidor.'
    });

  } catch (err) {
    if ((err as Error).message === 'TOKEN_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'El token no existe o ya fue eliminado' });
    }
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}