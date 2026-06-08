export interface RegisterUserServiceInfo {
  username: string;
  password: string;
  names: string;
  firstSurname: string;
  secondSurname: string | undefined;
  mainRegistrationEmail: string;
}

export interface LoginUserInfo {
  username: string; 
  password: string;
}

export interface ResetPasswordInfo {
  username: string;
  newPassword: string;
  verificationCode: string;
}

export interface ForgotPasswordInfo {
  username: string;
}

export interface VerifyResetCodeInfo {
  username: string;
  code: string;
}

export interface RefreshTokenInfo {
  refreshToken: string;
}