export interface EducationInfo {
  title: string;
  academyDegreeId: number;
  institution: string;
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

export interface UpdateEducationVisibilityInfo {
  visibilities: Record<string, boolean>;
}