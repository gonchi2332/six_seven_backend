/** Estados de verificación posibles para un usuario. */
export enum VerificationState {
  /** Usuario registrado pero aún no ha verificado su correo. */
  UNVERIFIED = "unverified",
  /** Usuario con correo electrónico verificado. */
  VERIFIED = "verified"
}

/** Estructura de los datos contenidos dentro de un token JWT. */
export interface TokenPayload {
  /** Nombre de usuario. */
  username: string;
  /** Estado de verificación actual. */
  state: VerificationState
}

/** Resultado de una operación de registro exitosa. */
export interface RegistrationResult {
  /** Datos básicos del usuario creado. */
  user: {
    username: string;
    state: VerificationState;
    names: string;
    first_surname: string;
    main_registration_email: string;
  };
}

/* Extensión de la interfaz Request de Express para incluir el payload del token. */
declare module "express-serve-static-core" {
  interface Request {
    /** Datos del usuario autenticado extraídos del token. */
    user?: TokenPayload;
  }
}