import { Request, Response } from "express";
import * as IdentityService from "../services/identity.service";

export async function selectRole(req: Request, res: Response): Promise<void> {
  try {
    const { roleId } = req.body;

    if (!roleId || typeof roleId !== "number") {
      res.status(400).json({ success: false, message: "El id del rol es obligatorio y debe ser numérico" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: "Token de autenticación inválido" });
      return;
    }

    const { token, roles, currentRoleId } = await IdentityService.selectRole(req.user, roleId);

    res.status(200).json({
      success: true,
      message: "Rol seleccionado correctamente",
      token,
      roles,
      currentRoleId
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      res.status(403).json({ success: false, message: (error as Error).message });
      return;
    }
    if ((error as Error).name === "NotFoundError") {
      res.status(404).json({ success: false, message: (error as Error).message });
      return;
    }
    res.status(500).json({ success: false, message: `Error en selectRole: ${(error as Error).message}` });
  }
}

export async function getCurrentRoleResources(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Token de autenticación inválido" });
      return;
    }

    const currentRoleId = req.user.current_role_id;
    if (currentRoleId == null) {
      res.status(400).json({
        success: false,
        message: "El token no contiene un rol actual. Seleccione un rol antes de consultar los recursos"
      });
      return;
    }

    const resources = await IdentityService.getRoleResources(currentRoleId);

    res.status(200).json({
      success: true,
      roleId: currentRoleId,
      resources
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error en getCurrentRoleResources: ${(error as Error).message}` });
  }
}
