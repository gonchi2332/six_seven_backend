import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: "Faltan campos obligatorios" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Correo electrónico no válido" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }

    const { user, token } = await AuthService.registerUserService(username, email, password);

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
      error: "Error interno del servidor" 
    });
  }
}
