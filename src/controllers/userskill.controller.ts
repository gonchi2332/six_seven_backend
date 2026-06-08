import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as UserSkillValidations from "../validators/userskill.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as UserSkillService from "../services/userskill.service";

/**
 * Función interna `registerNewSkill` que centraliza el registro de una nueva habilidad
 * (técnica o blanda) en el sistema y la asocia al usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user` y los
 * datos de la nueva habilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @param {"hard" | "soft"} skillType - Tipo de habilidad: "hard" para técnica o "soft" para blanda.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 201 si la habilidad se registró correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
async function registerNewSkill(
  req: Request,
  res: Response,
  skillType: "hard" | "soft") {
  try {
    const validations = UserSkillValidations.registerNewSkillValidation(
      req.user as TokenTypes.TokenPayload, req.body, skillType);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (skillType === "hard") {
      ans = await UserSkillService.registerNewUserHardSkill(
        req.user as TokenTypes.TokenPayload, req.body);
    } else {
      ans = await UserSkillService.registerNewUserSoftSkill(
        req.user as TokenTypes.TokenPayload, req.body);
    }

    const response = ans;
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(201).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `registerNewHardSkill` registra una nueva habilidad técnica en el sistema
 * y la vincula al usuario autenticado. Aplica validación previa específica para hard skills.
 * @param {Request} req - Objeto de solicitud HTTP con los datos de la habilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta JSON con código 400 si la validación específica falla, o delega en
 * `registerNewSkill` con tipo "hard" para el resto del procesamiento.
 */
export async function registerNewHardSkill(req: Request, res: Response) {
  const validations = UserSkillValidations.registerNewHardSkillValidation(req.body);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await registerNewSkill(req, res, "hard");
}

/**
 * La función `registerNewSoftSkill` registra una nueva habilidad blanda en el sistema
 * y la vincula al usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP con los datos de la habilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `registerNewSkill` con tipo "soft".
 */
export async function registerNewSoftSkill(req: Request, res: Response) {
  return await registerNewSkill(req, res, "soft");
}

/**
 * Función interna `registerSkill` que asocia una habilidad existente en el sistema al perfil
 * del usuario autenticado (sin crear una nueva habilidad).
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user` y el
 * identificador de la habilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @param {"hard" | "soft"} skillType - Tipo de habilidad: "hard" para técnica o "soft" para blanda.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 201 si la habilidad se asoció correctamente al usuario,
 * o código 500 si ocurre un error interno del servidor.
 */
async function registerSkill(
  req: Request,
  res: Response,
  skillType: "hard" | "soft") {
  try {
    const validations = UserSkillValidations.registerSkillValidation(
      req.user as TokenTypes.TokenPayload, req.body, skillType);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (skillType === "hard") {
      ans = await UserSkillService.registerUserHardSkill(req.user as TokenTypes.TokenPayload, req.body);
    } else {
      ans = await UserSkillService.registerUserSoftSkill(req.user as TokenTypes.TokenPayload, req.body);
    }

    const response = ans;
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(201).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `registerHardSkill` asocia una habilidad técnica existente al perfil del usuario
 * autenticado. Aplica validación previa específica para hard skills.
 * @param {Request} req - Objeto de solicitud HTTP con el identificador de la habilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta JSON con código 400 si la validación específica falla, o delega en
 * `registerSkill` con tipo "hard".
 */
export async function registerHardSkill(req: Request, res: Response) {
  const validations = UserSkillValidations.registerHardSkillValidation(req.body);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await registerSkill(req, res, "hard");
}

/**
 * La función `registerSoftSkill` asocia una habilidad blanda existente al perfil del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP con el identificador de la habilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `registerSkill` con tipo "soft".
 */
export async function registerSoftSkill(req: Request, res: Response) {
  return await registerSkill(req, res, "soft");
}

/**
 * Función interna `viewSkillsBase` que obtiene las habilidades de un usuario según el tipo
 * y si la consulta es pública o privada, evitando duplicación entre los distintos endpoints.
 * @param {Request} req - Objeto de solicitud HTTP. Usa `req.params` para consultas públicas
 * o `req.user` para consultas privadas.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @param {"hard" | "soft"} skillType - Tipo de habilidad a consultar.
 * @param {boolean} isPublic - Indica si la consulta es pública (true) o privada (false).
 * @returns Respuesta JSON con código 400 si las validaciones fallan, código 200 con lista vacía
 * si el usuario no tiene habilidades registradas, código 200 con la lista de habilidades si existen,
 * o código 500 si ocurre un error interno del servidor.
 */
async function viewSkillsBase(req: Request, res: Response, skillType: "hard" | "soft", isPublic: boolean) {
  try {
    const parameter = isPublic ? req.params : req.user as TokenTypes.TokenPayload;
    const validations = UserSkillValidations.viewSkillsBaseValidation(parameter);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const skillTypeWord = (skillType === "hard") ? "tecnicas" : "blandas";
    let ans;
    if (skillType === "hard") {
      ans = isPublic
        ? await UserSkillService.viewPublicUserHardSkills(
          req.params || (req.user as TokenTypes.TokenPayload))
        : await UserSkillService.viewPrivateUserHardSkills(
          req.params || (req.user as TokenTypes.TokenPayload));
    } else {
      ans = isPublic
        ? await UserSkillService.viewPublicUserSoftSkills(
          req.params || (req.user as TokenTypes.TokenPayload))
        : await UserSkillService.viewPrivateUserSoftSkills(
          req.params || (req.user as TokenTypes.TokenPayload));
    }
    const response = ans;
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.skills);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: `El usuario no tiene habilidades ${skillTypeWord} ${isPublic ? "publicas " : ""}registradas`,
        skills: []
      });
    }
    return res.status(200).json({
      success: true,
      message: `Las habilidades ${skillTypeWord} se han obtenido correctamente`,
      skills: response.skills
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `viewPublicHardSkills` obtiene las habilidades técnicas públicas de un usuario
 * identificado por los parámetros de ruta.
 * @param {Request} req - Objeto de solicitud HTTP con el identificador del usuario en `req.params`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `viewSkillsBase` con tipo "hard" y modo público.
 */
export async function viewPublicHardSkills(req: Request, res: Response) {
  return await viewSkillsBase(req, res, "hard", true);
}

/**
 * La función `viewPrivateHardSkills` obtiene todas las habilidades técnicas del usuario autenticado,
 * tanto públicas como privadas.
 * @param {Request} req - Objeto de solicitud HTTP con el usuario autenticado en `req.user`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `viewSkillsBase` con tipo "hard" y modo privado.
 */
export async function viewPrivateHardSkills(req: Request, res: Response) {
  return await viewSkillsBase(req, res, "hard", false);
}

/**
 * La función `viewPublicSoftSkills` obtiene las habilidades blandas públicas de un usuario
 * identificado por los parámetros de ruta.
 * @param {Request} req - Objeto de solicitud HTTP con el identificador del usuario en `req.params`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `viewSkillsBase` con tipo "soft" y modo público.
 */
export async function viewPublicSoftSkills(req: Request, res: Response) {
  return await viewSkillsBase(req, res, "soft", true);
}

/**
 * La función `viewPrivateSoftSkills` obtiene todas las habilidades blandas del usuario autenticado,
 * tanto públicas como privadas.
 * @param {Request} req - Objeto de solicitud HTTP con el usuario autenticado en `req.user`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `viewSkillsBase` con tipo "soft" y modo privado.
 */
export async function viewPrivateSoftSkills(req: Request, res: Response) {
  return await viewSkillsBase(req, res, "soft", false);
}

/**
 * La función `modifyHardSkill` actualiza los datos de una habilidad técnica asociada al usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user` y los campos
 * a modificar en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 con confirmación si la habilidad se modificó correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function modifyHardSkill(req: Request, res: Response) {
  try {
    const validations = UserSkillValidations.modifyHardSkillValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await UserSkillService.modifyUserHardSkill(req.user as TokenTypes.TokenPayload, req.body);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: "Habilidad tecnica modificada correctamente." });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor ${(err as Error).message}`
    });
  }
}

/**
 * Función interna `deleteSkill` que elimina una habilidad del perfil del usuario autenticado,
 * ya sea técnica o blanda.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user` y el
 * identificador de la habilidad a eliminar en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @param {"hard" | "soft"} skillType - Tipo de habilidad a eliminar.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 si la habilidad se eliminó correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
async function deleteSkill(req: Request, res: Response, skillType: "hard" | "soft") {
  try {
    const validations = UserSkillValidations.deleteSkillValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (skillType === "hard") {
      ans = await UserSkillService.deleteUserHardSkill(req.user as TokenTypes.TokenPayload, req.body);
    } else {
      ans = await UserSkillService.deleteUserSoftSkill(req.user as TokenTypes.TokenPayload, req.body);
    }

    const response = ans;
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor ${(err as Error).message}`
    });
  }
}

/**
 * La función `deleteHardSkill` elimina una habilidad técnica del perfil del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP con el identificador de la habilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `deleteSkill` con tipo "hard".
 */
export async function deleteHardSkill(req: Request, res: Response) {
  return await deleteSkill(req, res, "hard");
}

/**
 * La función `deleteSoftSkill` elimina una habilidad blanda del perfil del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP con el identificador de la habilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `deleteSkill` con tipo "soft".
 */
export async function deleteSoftSkill(req: Request, res: Response) {
  return await deleteSkill(req, res, "soft");
}

/**
 * La función `modifySkillsVisibility` actualiza la configuración de visibilidad de las habilidades
 * del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user` y la nueva
 * configuración de visibilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 si la visibilidad se actualizó correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function modifySkillsVisibility(req: Request, res: Response) {
  try {
    const validations = UserSkillValidations.modifySkillsVisibilityValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await UserSkillService.updateSkillsVisibility(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}