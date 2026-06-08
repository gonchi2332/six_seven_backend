/** Tipos de habilidades soportadas por el sistema. */
export enum SkillType {
  /** Habilidades técnicas o conocimientos específicos. */
  HARDSKILL = "hard",
  /** Habilidades interpersonales o rasgos de personalidad. */
  SOFTSKILL = "soft"
}

/** Respuesta del servicio de moderación para nuevas habilidades. */
export interface SkillModerationResponse {
  /** Indica si la habilidad es válida y permitida. */
  valid: boolean,
  /** Razón del rechazo si no es válida. */
  reason: string,
  /** Nombre sugerido o corregido de la habilidad (opcional). */
  name?: string,
  /** Nombre canónico (normalizado) de la habilidad (opcional). */
  canonName?: string
}