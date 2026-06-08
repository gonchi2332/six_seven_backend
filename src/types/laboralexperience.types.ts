/** Información detallada de un registro de experiencia laboral. */
export interface LaboralExperienceInfo {
  /** Nombre del cargo o posición ocupada. */
  position: string;
  /** Nombre de la empresa u organización. */
  companyName: string;
  /** Descripción de las responsabilidades y logros. */
  description: string;
  /** Fecha de inicio en el cargo. */
  startDate: Date;
  /** Fecha de finalización (opcional, puede ser Date o string vacío si es actual). */
  endDate?: Date | string;
}

/** Respuesta del servicio de moderación para cargos laborales. */
export interface PositionModerationResponse {
  /** Indica si el nombre del cargo es válido. */
  valid: boolean;
  /** Razón del rechazo si no es válido. */
  reason: string;
}