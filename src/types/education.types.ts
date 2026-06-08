/** Información detallada de un registro de formación académica. */
export interface EducationInfo {
  /** Título obtenido o en curso. */
  title: string;
  /** ID del grado académico asociado (ej. Licenciatura, Maestría). */
  academyDegreeId: number;
  /** Nombre de la institución educativa. */
  institution: string;
  /** Fecha de inicio de los estudios. */
  startDate: Date;
  /** Estado actual de la educación. */
  educationState: EducationState;
}

/** Estados posibles de un registro de educación. */
export enum EducationState {
  /** El usuario aún se encuentra estudiando. */
  CURSANDO = "Cursando",
  /** El usuario ya ha completado sus estudios. */
  FINALIZADA = "Egresado"
}

/** Información básica de un grado académico. */
export interface AcademicGradeInfo {
  /** Nombre del grado (ej. 'Técnico Superior'). */
  name: string;
}

/** Respuesta del servicio de moderación para títulos académicos. */
export interface TitleModerationResponse {
  /** Indica si el título es válido y no contiene lenguaje inapropiado. */
  valid: boolean;
  /** Razón del rechazo si no es válido. */
  reason: string;
}

/** Estructura para actualizar la visibilidad de múltiples registros de educación. */
export interface UpdateEducationVisibilityInfo {
  /** Mapa de IDs de registros y sus nuevos estados de visibilidad. */
  visibilities: Record<string, boolean>;
}