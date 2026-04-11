export enum VerificationState {
  UNVERIFIED = "unverified",
  VERIFIED = "verified"
}

export interface TokenPayload {
  username: string;
  state?: VerificationState;
  names?: string;
  paternalSurname?: string;
  maternalSurname?: string;
}


export interface RegistrationResult {
  user: {
    username: string;
    state: VerificationState;
  };
  userDetail: {
    names: string;
    paternal_surname: string;
  };
}

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}