/** Información requerida para guardar el enlace de LinkedIn de un usuario. */
export interface SaveUserLinkedinInfo {
  /** Nombre de usuario en el sistema. */
  username: string;
  /** Nombre de usuario o enlace de LinkedIn. */
  linkedinUsername: string;
}

/** Información requerida para guardar el enlace de GitHub de un usuario. */
export interface SaveUserGithubinInfo {
  /** Nombre de usuario en el sistema. */
  username: string;
  /** Nombre de usuario o enlace de GitHub. */
  githubUsername: string;
}