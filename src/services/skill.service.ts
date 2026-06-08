import { getSkillTypeData } from "../helpers/skill.helper";
import * as SkillRepository from "../repositories/skill.repository";

export async function getAllSkills(type: "hard" | "soft") {
  try {
    const skillTypeData = await getSkillTypeData(type);
    
    const allSkills = await SkillRepository.getAllSkills(skillTypeData.enum);
    return {
      result: true,
      messageState: `Todas las habilidades ${skillTypeData.pluralWord} registradas se han obtenido correctamente.`,
      skills: allSkills
    };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}