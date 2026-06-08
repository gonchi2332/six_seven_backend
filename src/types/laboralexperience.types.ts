export interface LaboralExperienceInfo {
  position: string;
  companyName: string;
  description: string;
  startDate: Date;
  endDate?: Date | string;
}

export interface PositionModerationResponse {
  valid: boolean;
  reason: string;
}