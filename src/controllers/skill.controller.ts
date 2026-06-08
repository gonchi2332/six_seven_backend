import { Request, Response } from "express";
import { getSkillTypeData } from "../helpers/skill.helper";
import * as ArrayValidation from "../validators/shared/array.validator";
import * as SkillService from "../services/skill.service";

/**
 * Función interna `getAllSkills` que obtiene todas las habilidades del sistema según su tipo.
 * Es utilizada por `getAllHardSkills` y `getAllSoftSkills` para evitar duplicación de lógica.
 * @param {Request} req - Objeto de solicitud HTTP. No requiere parámetros adicionales.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @param {"hard" | "soft"} skillType - Tipo de habilidad a consultar: "hard" para técnicas
 * o "soft" para blandas.
 * @returns Respuesta JSON con código 400 si el servicio falla, código 200 con un mensaje indicando
 * que no hay habilidades registradas si la lista está vacía, código 200 con la lista de habilidades
 * si existen, o código 500 si ocurre un error interno del servidor.
 */
async function getAllSkills(req: Request, res: Response, skillType: "hard" | "soft") {
  try {
    const skillTypeData = await getSkillTypeData(skillType);

    const response = await SkillService.getAllSkills(skillType);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidation.validateEmptyArray(response.skills);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: `No existen habilidades ${skillTypeData.pluralWord} registradas en el sistema.`
      });
    }
    return res.status(200).json({
      success: true,
      message: `Todas las habilidades ${skillTypeData.pluralWord} registradas se han obtenido correctamente.`,
      data: response.skills
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `getAllHardSkills` obtiene todas las habilidades técnicas (hard skills) registradas en el sistema.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `getAllSkills` con tipo "hard".
 */
export async function getAllHardSkills(req: Request, res: Response) {
  return await getAllSkills(req, res, "hard");
}

/**
 * La función `getAllSoftSkills` obtiene todas las habilidades blandas (soft skills) registradas en el sistema.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `getAllSkills` con tipo "soft".
 */
export async function getAllSoftSkills(req: Request, res: Response) {
  return await getAllSkills(req, res, "soft");
}