/** Información requerida para el registro de un nuevo usuario en el servicio. */
export interface RegisterUserServiceInfo {
  /** Nombre de usuario único. */
  username: string;
  /** Contraseña en texto plano (será hasheada). */
  password: string;
  /** Nombres del usuario. */
  names: string;
  /** Primer apellido del usuario. */
  firstSurname: string;
  /** Segundo apellido opcional. */
  secondSurname: string | undefined;
  /** Correo electrónico principal de registro. */
  mainRegistrationEmail: string;
}

/** Información requerida para el inicio de sesión. */
export interface LoginUserInfo {
  /** Nombre de usuario. */
  username: string;
  /** Contraseña en texto plano. */
  password: string;
}

/** Información requerida para restablecer la contraseña. */
export interface ResetPasswordInfo {
  /** Nombre de usuario. */
  username: string;
  /** Nueva contraseña en texto plano. */
  newPassword: string;
  /** Código de verificación enviado por correo. */
  verificationCode: string;
}

/** Información requerida para solicitar el restablecimiento de contraseña. */
export interface ForgotPasswordInfo {
  /** Nombre de usuario. */
  username: string;
}

/** Información requerida para verificar un código de restablecimiento. */
export interface VerifyResetCodeInfo {
  /** Nombre de usuario. */
  username: string;
  /** Código de verificación a validar. */
  code: string;
}

/** Información requerida para renovar el token de acceso. */
export interface RefreshTokenInfo {
  /** Token de refresco válido. */
  refreshToken: string;
}