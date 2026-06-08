/** Estructura para actualizar la visibilidad de los campos de información personal. */
export interface UpdatePersonalInfoVisibility {
  /** Mapa donde la clave es el nombre del campo y el valor es su estado de visibilidad. */
  visibilities: Record<string, boolean>;
}