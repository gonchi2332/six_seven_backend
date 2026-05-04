import * as SkillTypes from "../types/skill.types";

export function getSkillTypeData(type: "hard" | "soft") {
  const types = {
    hard: {
      enum: SkillTypes.SkillType.HARDSKILL,
      singleWord: "tecnica",
      pluralWord: "tecnicas"    
    },
    soft: {
      enum: SkillTypes.SkillType.SOFTSKILL,
      singleWord: "blanda",
      pluralWord: "blandas"
    }
  };
  return types[type];
}