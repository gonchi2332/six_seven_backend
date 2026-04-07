export enum VerificationState {
  NO_VERIFICADO = "no verificado",
  VERIFICADO = "verificado"
}

export interface TokenPayload {
  id: number;
  username: string;
  roleId: number;
  state: VerificationState;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}