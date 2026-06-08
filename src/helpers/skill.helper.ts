import { getFuse } from "../config/fuse.config";
import * as SkillTypes from "../types/skill.types";

/**
 * Obtiene la configuración y herramientas asociadas a un tipo de habilidad (Hard o Soft).
 * Incluye el enum, palabras descriptivas, formateador y la instancia de Fuse.js.
 * @param {"hard" | "soft"} type - Tipo de habilidad.
 * @returns {Object} Configuración completa para el tipo de habilidad.
 */
export function getSkillTypeData(type: "hard" | "soft") {
  const types = {
    hard: {
      enum: SkillTypes.SkillType.HARDSKILL,
      singleWord: "tecnica",
      pluralWord: "tecnicas",
      formater: formatHardSkillName,
      fuse: getFuse(SkillTypes.SkillType.HARDSKILL)
    },
    soft: {
      enum: SkillTypes.SkillType.SOFTSKILL,
      singleWord: "blanda",
      pluralWord: "blandas",
      formater: formatSoftSkillName,
      fuse: getFuse(SkillTypes.SkillType.SOFTSKILL)
    }
  };
  return types[type];
}

/**
 * Formatea el nombre de una Hard Skill.
 * Normaliza espacios, convierte a minúsculas y permite caracteres especiales comunes en tecnología (+, #, .).
 * @param {string} skillName - Nombre original de la habilidad.
 * @returns {string} Nombre formateado.
 */
export function formatHardSkillName(skillName: string) {
  return skillName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\sáéíóúñ+#.]/gi, "");
}

/**
 * Formatea el nombre de una Soft Skill.
 * Normaliza espacios, convierte a minúsculas y permite solo caracteres alfabéticos y tildes.
 * @param {string} skillName - Nombre original de la habilidad.
 * @returns {string} Nombre formateado.
 */
export function formatSoftSkillName(skillName: string) {
  return skillName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\wáéíóúüñÁÉÍÓÚÜÑ\s]/gi, "");
}