export enum VerificationState {
  UNVERIFIED = "unverified",
  VERIFIED = "verified"
}

export interface TokenPayload {
  username: string;
  state: VerificationState
}

export interface RegistrationResult {
  user: {
    username: string;
    state: VerificationState;
    names: string;
    first_surname: string;
    main_registration_email: string;
  };
}

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}