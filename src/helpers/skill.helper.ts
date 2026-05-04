import { getFuse } from "../config/fuse.config";
import * as SkillTypes from "../types/skill.types";

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

export function formatHardSkillName(skillName: string) {
  return skillName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\sáéíóúñ+#.]/gi, "");
}

export function formatSoftSkillName(skillName: string) {
  return skillName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\wáéíóúüñÁÉÍÓÚÜÑ\s]/gi, "");
}