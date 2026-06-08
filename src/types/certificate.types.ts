/** Información detallada de un certificado profesional. */
export interface CertificateInfo {
  /** Título del certificado. */
  title: string;
  /** Descripción del certificado o habilidades acreditadas. */
  description: string;
  /** Área de conocimiento asociada. */
  area: string;
  /** Fecha de emisión del certificado. */
  issueDate: Date;
}

/** Respuesta del servicio de moderación y extracción de texto para certificados. */
export interface CertificateModerationResponse {
  /** Indica si el certificado es válido y coherente con la imagen. */
  valid: boolean;
  /** Texto extraído de la imagen mediante OCR (opcional). */
  extractedText?: string;
  /** Razón del rechazo si no es válido (opcional). */
  reason?: string;
}

/** Estructura simple para manejar un ID numérico. */
export interface IdInfo {
  /** Identificador único. */
  id: number
}

/** Estructura para actualizar la visibilidad de múltiples certificados. */
export interface UpdateCertificatesVisibilityInfo {
  /** Mapa de IDs de certificados y sus nuevos estados de visibilidad. */
  visibilities: Record<string, boolean>;
}