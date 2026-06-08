import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as UserSkillValidations from "../validators/userskill.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as UserSkillService from "../services/userskill.service";

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

export async function registerNewHardSkill(req: Request, res: Response) {
  const validations = UserSkillValidations.registerNewHardSkillValidation(req.body);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await registerNewSkill(req, res, "hard");
}

export async function registerNewSoftSkill(req: Request, res: Response) {
  return await registerNewSkill(req, res, "soft");
}

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

export async function registerHardSkill(req: Request, res: Response) {
  const validations = UserSkillValidations.registerHardSkillValidation(req.body);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await registerSkill(req, res, "hard");
}

export async function registerSoftSkill(req: Request, res: Response) {
  return await registerSkill(req, res, "soft");
}

async function viewSkillsBase(req: Request, res: Response, skillType: "hard" | "soft", isPublic: boolean) {
  try {
    const validations = UserSkillValidations.viewSkillsBaseValidation(
      req.params || (req.user as TokenTypes.TokenPayload));
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

export async function viewPublicHardSkills(req: Request, res: Response) {
  return await viewSkillsBase(req, res, "hard", true);
}

export async function viewPrivateHardSkills(req: Request, res: Response) {
  return await viewSkillsBase(req, res, "hard", false);
}

export async function viewPublicSoftSkills(req: Request, res: Response) {
  return await viewSkillsBase(req, res, "soft", true);
}

export async function viewPrivateSoftSkills(req: Request, res: Response) {
  return await viewSkillsBase(req, res, "soft", false);
}

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

export async function deleteHardSkill(req: Request, res: Response) {
  return await deleteSkill(req, res, "hard");
}

export async function deleteSoftSkill(req: Request, res: Response) {
  return await deleteSkill(req, res, "soft");
}

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