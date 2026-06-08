import Fuse from "fuse.js";
import * as MeasureConstants from "../utils/constants/measure.constants";
import * as SkillTypes from "../types/skill.types";
import * as SkillRepository from "../repositories/skill.repository";

export async function getFuse(skillType: SkillTypes.SkillType) {
  try{
    const skills = await SkillRepository.getAllSkillsCanonName(skillType);
    const fuse = new Fuse(skills, { threshold: MeasureConstants.fuseThreshold });
    return fuse;
  } catch (err) {
    throw (err as Error).message;
  }
}