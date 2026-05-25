export interface EducationInfo {
  title: string;
  academyDegreeId: number;
  institution: string;
  //visible: boolean;
  startDate: Date;
  educationState: EducationState;
}

export enum EducationState {
  CURSANDO = "Cursando",
  FINALIZADA = "Egresado"
}

export interface AcademicGradeInfo {
  name: string;
}

export interface TitleModerationResponse {
  valid: boolean;
  reason: string;
}

export interface CertificateModerationResponse {
  valid: boolean;
  extractedText?: string;
  reason?: string;
}