import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, names, firstSurname, mainRegistrationEmail } = req.body;

    if (!username || typeof username !== "string" ||
      !password || typeof password !== "string" ||
      !names || typeof names !== "string" ||
      !firstSurname || typeof firstSurname !== "string" ||
      !mainRegistrationEmail || typeof mainRegistrationEmail !== "string") {
      res.status(400).json({ error: "Faltan campos obligatorios." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mainRegistrationEmail)) {
      res.status(400).json({ error: "Formato de correo electronico invalido."});
      return;
    }

    const { user, token } = await AuthService.registerUserService(username, password, names, firstSurname, mainRegistrationEmail);

    res.status(201).json({
      user,
      token
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

    const { user, profilePicture, token } = await AuthService.login(username, password);

    res.status(200).json({
      success: true,
      message: `Inicio de sesion exitoso del usuario ${username}`,
      user,
      profilePicture,
      token
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
      res.status(400).json({ error: "El nombre de usuario es obligatorio." });
      return;
    }

    const response = await AuthService.forgotPasswordService(username);
    res.status(200).json(response);

  } catch (err) {
    if ((err as Error).name === "NotFoundError") {
      res.status(404).json({ error: (err as Error).message });
      return;
    }
    res.status(500).json({ 
      message: `Error en forgotPassword: ${(err as Error).message}`,
      error: "Error interno del servidor." 
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
