import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as SkillService from "../services/skill.service";

export async function viewHardSkills(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario invalido."
      });
    }

    const { result, messageState, skills } = await SkillService.viewUserHardSkills(username);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    if (!skills || skills.length === 0) {
      return res.status(200).json({
        success: true,
        message: `${username} no tiene habilidades tecnicas registradas.`
      });
    }
    return res.status(200).json({
      success: true,
      message: `Habilidades tecnicas de ${username} obtenidas correctamente.`,
      hardSkills: skills
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}