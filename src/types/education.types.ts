export interface EducationInfo {
  title: string;
  academyDegreeId: number;
  institution: string;
  //visible: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface AcademicGradeInfo {
  name: string;
}

export interface TitleModerationResponse {
  valid: boolean;
  reason: string;
}
