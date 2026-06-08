import { processReturnQuery } from "../utils/query.util";
import * as SkillTypes from "../types/skill.types";

/**
 * Obtiene todas las habilidades de un tipo específico (técnicas o blandas).
 * @param {SkillTypes.SkillType} skillType - Tipo de habilidad ('hard' o 'soft').
 * @returns Promesa con la lista de nombres de habilidades.
 */
export async function getAllSkills(skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT name FROM "skill"
    WHERE type = $1
  `;
  const skills = await processReturnQuery(selectQuery, [skillType]);
  return skills;
}

/**
 * Obtiene todos los nombres canónicos (normalizados) de las habilidades de un tipo específico.
 * @param {SkillTypes.SkillType} skillType - Tipo de habilidad ('hard' o 'soft').
 * @returns Promesa con la lista de nombres canónicos de habilidades.
 */
export async function getAllSkillsCanonName(skillType: SkillTypes.SkillType) {
  const selectQuery = `
    SELECT canon_name FROM "skill"
    WHERE type = $1
  `;
  const skills = await processReturnQuery(selectQuery, [skillType]);
  return skills;
}