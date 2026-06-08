/** Información requerida para asociar una nueva habilidad a un usuario. */
export interface RegisterNewUserSkillInfo {
  /** Nombre de la habilidad a registrar. */
  skillName: string;
  /** Puntuación de autoevaluación (opcional, solo para hard skills). */
  punctuation?: number;
}

/** Información requerida para modificar una habilidad de usuario existente. */
export interface ModifyUserSkillInfo {
  /** Nombre de la habilidad a modificar. */
  skillName: string;
  /** Nueva puntuación de autoevaluación. */
  newPunctuation: number;
}

/** Información requerida para eliminar una habilidad de usuario. */
export interface DeleteUserSkillInfo {
  /** Nombre de la habilidad a desasociar. */
  skillName: string;
}

/** Estructura para actualizar la visibilidad de múltiples habilidades de usuario. */
export interface UpdateSkillVisibilityInfo {
  /** Mapa de IDs de habilidades y sus nuevos estados de visibilidad. */
  visibilities: Record<string, boolean>;
}