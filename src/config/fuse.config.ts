import Fuse from "fuse.js";
import * as MeasureConstants from "../utils/constants/measure.constants";
import * as SkillTypes from "../types/skill.types";
import * as SkillRepository from "../repositories/skill.repository";

/**
 *La función `getFuse` recupera habilidades de un tipo específico y crea una instancia de Fuse con un
 *umbral especificado.
 *@param skillType: el tipo de habilidad es un parámetro que especifica el tipo de habilidades que se recuperarán
 *del repositorio de habilidades.
 *@returns La función `getFuse` devuelve un objeto `Fuse` creado con las habilidades recuperadas de
 *el SkillRepository basado en el `skillType` proporcionado.
 */
export async function getFuse(skillType: SkillTypes.SkillType) {
  try{
    const skills = await SkillRepository.getAllSkillsCanonName(skillType);
    const fuse = new Fuse(skills, { threshold: MeasureConstants.fuseThreshold });
    return fuse;
  } catch (err) {
    throw (err as Error).message;
  }
}