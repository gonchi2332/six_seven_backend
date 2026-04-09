export enum VerificationState {
  NO_VERIFICADO = "no verificado",
  VERIFICADO = "verificado"
}

export interface TokenPayload {
  username: string;
  state: VerificationState;
  names: string;
  paternalSurname: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}