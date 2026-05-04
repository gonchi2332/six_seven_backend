import { Request, Response } from "express";
import { getSkillTypeData } from "../helpers/skill.helper";
import * as SkillService from "../services/skill.service";

async function getAllSkills(req: Request, res: Response, skillType: "hard" | "soft") {
  try {
    const skillTypeData = await getSkillTypeData(skillType);

    const { result, messageState, skills } = await SkillService.getAllSkills(skillType);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    if (!skills || skills.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No existen habilidades ${skillTypeData.pluralWord} registradas en el sistema.`
      });
    }
    return res.status(200).json({
      success: true,
      message: `Todas las habilidades ${skillTypeData.pluralWord} registradas se han obtenido correctamente.`,
      data: skills
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function getAllHardSkills(req: Request, res: Response) {
  return await getAllSkills(req, res, "hard");
}

export async function getAllSoftSkills(req: Request, res: Response) {
  return await getAllSkills(req, res, "soft");
}