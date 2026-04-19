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

export async function registerHardSkill(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { skillName, punctuation } = req.body;

    if (!username || typeof username !== "string" ||
      !skillName || typeof skillName !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario o de habilidad incompletos o invalidos."
      });
    }
    if (skillName.length === 0 || skillName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "El nombre de habilidad supera el limite de caracteres o es invalido."
      });
    }
    if (!punctuation || typeof punctuation !== "number") {
      return res.status(400).json({
        success: false,
        message: "Puntuacion invalida."
      });
    }
    if (punctuation < 1 || punctuation > 5) {
      return res.status(400).json({
        success: false,
        message: "Puntuacion fuera de rango, la puntuacion debe ser un numero entre 1 y 5."
      });
    }

    const { result, messageState } = await SkillService.registerUserHardSkill(username, skillName, punctuation);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: "Habilidad tecnica registrada correctamente."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function modifyHardSkill(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { skillName, newPunctuation } = req.body;


    if (!username || typeof username !== "string" ||
      !skillName || typeof skillName !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario o de habilidad incompletos o invalidos."
      });
    }
    if (skillName.length === 0 || skillName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "El nombre de habilidad supera el limite de caracteres o es invalido."
      });
    }
    if (!newPunctuation || typeof newPunctuation !== "number") {
      return res.status(400).json({
        success: false,
        message: "Puntuacion invalida."
      });
    }
    if (newPunctuation < 1 || newPunctuation > 5) {
      return res.status(400).json({
        success: false,
        message: "Puntuacion fuera de rango, la puntuacion debe ser un numero entre 1 y 5."
      });
    }

    const { result, messageState } = await SkillService.modifyUserHardSkill(username, skillName, newPunctuation);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: "Habilidad tecnica modificada correctamente."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor ${(err as Error).message}`
    });
  }
}

export async function deleteHardSkill(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { skillName } = req.body;

    if (!username || typeof username !== "string" ||
      !skillName || typeof skillName !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario o de habilidad incompletos o invalidos."
      });
    }
    if (skillName.length === 0 || skillName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "El nombre de habilidad supera el limite de caracteres o es invalido."
      });
    }

    const { result, messageState } = await SkillService.deleteUserHardSkill(username, skillName);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: "Habilidad tecnica eliminada correctamente."
    }); 
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor ${(err as Error).message}`
    });
  }
}