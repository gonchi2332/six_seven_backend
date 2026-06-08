/** Estructura de un enlace asociado a un proyecto. */
export interface ProjectLink {
  /** Etiqueta descriptiva del enlace (ej. 'Repositorio', 'Demo'). */
  label: string;
  /** URL del enlace. */
  url: string;
}

/** Información completa de un proyecto personal. */
export interface ProjectInfo {
  /** Nombre del proyecto. */
  name: string;
  /** Descripción detallada del proyecto. */
  description: string;
  /** Tema o categoría del proyecto. */
  topic: string;
  /** Rol desempeñado por el usuario en el proyecto. */
  role: string;
  /** Estado actual del proyecto (ej. 'En desarrollo', 'Finalizado'). */
  status: string;
  /** Lista de enlaces relacionados. */
  links: ProjectLink[];
  /** Buffer de la imagen del proyecto (opcional). */
  imageBuffer?: Buffer;
}

/** Estructura para actualizar la visibilidad de múltiples proyectos. */
export interface UpdateProjectsVisibilityInfo {
  /** Mapa de IDs de proyectos y sus nuevos estados de visibilidad. */
  visibilities: Record<string, boolean>;
}