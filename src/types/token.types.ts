export enum VerificationState {
  UNVERIFIED = "unverified",
  VERIFIED = "verified"
}

export interface UserRole {
  id: number;
  name: string;
  active: boolean;
}

export interface TokenPayload {
  username: string;
  state: VerificationState;
  roles: UserRole[];
  current_role_id?: number | null;
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