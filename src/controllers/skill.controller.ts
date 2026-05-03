import { Request, Response } from "express";
import { profanity, uniqueWords } from "../config/leoprofanity.config";
import { containsBadWord } from "../utils/validations";
import { getSkillTypeData } from "../helpers/skill.helper";
import * as MeasureConstants from "../utils/constants/measure.constants";
import * as RegexConstants from "../utils/constants/regex.constants"; 
import * as TokenTypes from "../types/token.types";
import * as SkillService from "../services/skill.service";

async function registerNewSkill(
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
        message: "Nombre de usuario faltante o invalido."
      });
    }

    const skillTypeData = getSkillTypeData(skillType);

    const formatedSkillName = skillTypeData.formater(skillName);
    if (!formatedSkillName || typeof formatedSkillName !== "string" ||
      formatedSkillName.length === 0 || formatedSkillName.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de habilidad supera el limite de caracteres o es invalido."
      });
    }
    if (profanity.check(formatedSkillName) || containsBadWord(formatedSkillName, uniqueWords)) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la habilidad es inapropiado."
      });
    }
    const resultSkillNames = (await skillTypeData.fuse).search(formatedSkillName);
    let correctedSkillName;
    if (resultSkillNames.length === 0 || !resultSkillNames[0].score ||
      resultSkillNames[0].score > MeasureConstants.fuseThreshold) {
      correctedSkillName = formatedSkillName; 
    }
    correctedSkillName = resultSkillNames[0].item;

    let ans;
    if (skillType === "hard") {
      if (!punctuation || typeof punctuation !== "number") {
        return res.status(400).json({
          success: false,
          message: "Puntuacion invalida o fuera de rango."
        });
      }
      if (punctuation < 0 || punctuation > 50) {
        return res.status(400).json({
          success: false,
          message: "Puntuacion fuera de rango, la puntuacion debe ser un numero entre 1 y 5."
        });
      }
      ans = await SkillService.registerNewUserHardSkill(username, correctedSkillName, punctuation);
    } else {
      if (!RegexConstants.latinAlphabetRegex.test(skillName)) {
        return res.status(400).json({
          success: false,
          message: "Solo se permite caracteres del alfabeto latino."
        });
      }
      ans = await SkillService.registerNewUserSoftSkill(username, formatedSkillName);
    }

    const { result, messageState } = ans;
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(201).json({
      success: true,
      message: `La habilidad ${skillTypeData.pluralWord}: ${skillName} se ha registrado correctamente.`
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  } 
}

export async function registerNewHardSkill(req: Request, res: Response) {
  const { punctuation } = req.body;
  return await registerNewSkill(req, res, "hard", punctuation);
}

export async function registerNewSoftSkill(req: Request, res: Response) {
  return await registerNewSkill(req, res, "soft");
}

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
    
    const skillTypeData = getSkillTypeData(skillType);

    if (!skillName || typeof skillName !== "string" || 
      skillName.length === 0 || skillName.length > 50) {
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
      ans = await SkillService.registerUserHardSkill(username, skillName, punctuation);
    } else {
      if (!RegexConstants.latinAlphabetRegex.test(skillName)) {
        return res.status(400).json({
          success: false,
          message: "Solo se permite caracteres del alfabeto latino."
        });
      }
      ans = await SkillService.registerUserSoftSkill(username, skillName);
    }

    const { result, messageState } = ans;
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(201).json({
      success: true,
      message: `La habilidad ${skillTypeData.singleWord}: ${skillName} se ha registrado correctamente.`
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