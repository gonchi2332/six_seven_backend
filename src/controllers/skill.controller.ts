import { Request, Response } from "express";
import * as RegexConstants from "../utils/constants/regex.constants"; 
import * as TokenTypes from "../types/token.types";
import * as SkillService from "../services/skill.service";

async function registerSkill(
  req: Request, 
  res: Response,
  skillType: "hard" | "soft",
  punctuation?: number) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { skillName } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario faltante o invalidos."
      });
    }
    if (!skillName || typeof skillName !== "string" || 
      skillName.trim().length === 0 || skillName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "El nombre de habilidad supera el limite de caracteres o es invalido."
      });
    } 
    let ans;
    if (skillType === "hard") {
      if (!punctuation || typeof punctuation !== "number") {
        return res.status(400).json({
          success: false,
          message: "Puntuacion invalida o fuera de rango."
        });
      }
      if (punctuation < 1 || punctuation > 5) {
        return res.status(400).json({
          success: false,
          message: "Puntuacion fuera de rango, la puntuacion debe ser un numero entre 1 y 5."
        });
      }
      ans = await SkillService.registerUserHardSkill(username, skillName.trim(), punctuation);
    } else {
      if (!RegexConstants.latinAlphabetRegex.test(skillName)) {
        return res.status(400).json({
          success: false,
          message: "Solo se permite caracteres del alfabeto latino."
        });
      }
      ans = await SkillService.registerUserSoftSkill(username, skillName.trim());
    }

    const { result, messageState } = ans;
    const skillTypeWord = (skillType === "hard") ? "tecnica" : "blanda";
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(201).json({
      success: true,
      message: `La habilidad ${skillTypeWord}: ${skillName} se ha registrado correctamente.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function registerHardSkill(req: Request, res: Response) {
  const { punctuation } = req.body;
  return await registerSkill(req, res, "hard", punctuation);
}

export async function registerSoftSkill(req: Request, res: Response) {
  return await registerSkill(req, res, "soft");
}

async function viewSkills(req: Request, res: Response, skillType: "hard" | "soft") {
  try {
    const { username } = req.user as TokenTypes.TokenPayload || req.query;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario invalido."
      });
    }

    const skillTypeWord = (skillType === "hard") ? "tecnicas" : "blandas";
    let ans;
    if (skillType === "hard") {
      ans = await SkillService.viewUserHardSkills(username);
    } else {
      ans = await SkillService.viewUserSoftSkills(username);
    }
    
    const { result, messageState, skills } = ans;
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    if (!skills || skills.length === 0) {
      return res.status(200).json({
        success: true,
        message: `El usuario no tiene habilidades ${skillTypeWord} registradas.`
      });
    }
    return res.status(200).json({
      success: true,
      message: `Las habilidades ${skillTypeWord} se han obtenido correctamente.`,
      skills: skills
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function viewHardSkills(req: Request, res: Response) {
  return await viewSkills(req, res, "hard");
}

export async function viewSoftSkills(req: Request, res: Response) {
  return await viewSkills(req, res, "soft");
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

async function deleteSkill(req: Request, res: Response, skillType: "hard" | "soft") {
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

    const skillTypeWord = (skillType === "hard") ? "tecnica" : "blanda";
    let ans;
    if (skillType === "hard") {
      ans = await SkillService.deleteUserHardSkill(username, skillName.trim());
    } else {
      ans = await SkillService.deleteUserSoftSkill(username, skillName.trim());
    }

    const { result, messageState } = ans;
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: `La habilidad ${skillTypeWord}: ${skillName} se ha eliminado correctamente.`
    }); 
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor ${(err as Error).message}`
    });
  }
}

export async function deleteHardSkill(req: Request, res: Response) {
  return await deleteSkill(req, res, "hard");
}

export async function deleteSoftSkill(req: Request, res: Response) {
  return await deleteSkill(req, res, "soft");
}