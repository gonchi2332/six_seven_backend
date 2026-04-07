import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as RegisterPersonalInfoService from "../services/register.service";

export async function registerPersonalInfo(req: Request, res: Response) {
  try {
    const { id, username, roleId, state } = req.user as TokenTypes.TokenPayload;
    const userPersonalInfo = req.body;

    if (!id || typeof id !== "number") {
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
    if (!roleId || typeof roleId !== "number") {
      return res.status(400).json({
        success: false,
        message: "Id de rol de usuario inexistente o invalido."
      });
    }
    if (!state || !Object.values(TokenTypes.VerificationState).includes(state)) {
      return res.status(400).json({
        success: false,
        message: "Estado de verificacion invalido."
      });
    }
    if (!userPersonalInfo || Object.keys(userPersonalInfo).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Parametros de informacion personal del usuario insuficientes."
      });
    }

    const { result, messageState } = await RegisterPersonalInfoService.registerUserPersonalInfo(id, username, userPersonalInfo);
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
        message: messageState
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