import { Request, Response } from "express";
import * as UserTypes from "../types/user.types";
import * as RegisterPersonalInfoService from "../services/register.service";

export async function registerPersonalInfo(req: Request, res: Response) {
  try {
    const { userId, username } = req.user as UserTypes.UserTokenPayload;
    const userPersonalInfo = req.body;

    if (!userId || typeof userId !== "number") {
      return res.status(400).json({
        success: false,
        message: "Id de usuario inexistente o invalido."
      });
    }
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario faltante o invalido."
      });
    }
    if (!userPersonalInfo || Object.keys(userPersonalInfo).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Parametros de informacion personal del usuario insuficientes."
      });
    }

    const { result, messageState } = await RegisterPersonalInfoService.registerUserPersonalInfo(userId, username, userPersonalInfo);
    if (!result) {
      if (messageState === "Usuario no encontrado.") {
        return res.status(400).json({
          success: false,
          message: "No es posible registrar la informacion personal del usuario, usuario no esta registrado."
        });
      }
      if (messageState === "Existen muchos usuarios con la misma identificacion.") {
        return res.status(400).json({
          success: false,
          message: "No es posible registrar la informacion personal del usuario, mas de un usuario registrado con las mismas credenciales."
        });
      }
      if (messageState === "Existen muchos detallles de usuario asociados a el mismo usuario.") {
        return res.status(400).json({
          success: false,
          message: "No es posible registrar la informacion del usuario, se detecto informacion ya registrada."
        });
      }
      return res.status(400).json({
        success: false,
        message: "No es posible registrar la informacion personal del usuario, credenciales incompletas o invalidas."
      });
    }
    return res.status(200).json({
      success: true,
      message: `La informacion personal del usuario ${username} se ha registrado correctamente.`
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}