import Fuse from "fuse.js";
import * as MeasureConstants from "../utils/constants/measure.constants";
import * as Selects from "../helpers/selects.helper";
import * as SkillTypes from "../types/skill.types";

export async function getFuse(skillType: SkillTypes.SkillType) {
  try{
    const skills = await Selects.getAllSkillsCanonName(skillType);
    const fuse = new Fuse(skills, { threshold: MeasureConstants.fuseThreshold });
    return fuse;
  } catch (err) {
    throw (err as Error).message;
  }
}