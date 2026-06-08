/** Respuesta del servicio de detección de contenido no apto para el trabajo (NSFW). */
export interface NSFWModerationResponse {
  /** Etiqueta de la categoría detectada (ej. 'porn', 'sexy', 'neutral'). */
  label: string;
  /** Puntuación de confianza de la detección (0.0 a 1.0). */
  score: number;
}