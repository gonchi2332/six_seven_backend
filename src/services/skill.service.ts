import { getSkillTypeData } from "../helpers/skill.helper";
import * as SkillRepository from "../repositories/skill.repository";

/**
 * La función `getAllSkills` recupera todas las habilidades registradas en el sistema de un tipo específico (técnicas o blandas).
 * @param {"hard" | "soft"} type - Tipo de habilidades a recuperar.
 * @returns Objeto con `result`, `messageState` y `skills` (lista de todas las habilidades del tipo solicitado).
 */
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