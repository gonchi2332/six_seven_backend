export interface LaboralExperienceInfo {
  position: string;
  companyName: string;
  description: string;
  //visible: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface PositionModerationResponse {
  valid: boolean;
  reason: string;
}