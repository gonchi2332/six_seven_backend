import { Request, Response } from "express";
import { registerUserService } from "../services/auth.service";

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

    const { user, token } = await registerUserService(username, email, password);

    res.status(201).json({
      user,
      token
    });

  } catch (error: any) {
    if (error.name === "ConflictError") {
      res.status(409).json({ error: error.message });
      return;
    }

    console.error("Error en registerUser:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
