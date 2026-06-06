export enum SkillType {
  HARDSKILL = "hard",
  SOFTSKILL = "soft"
}

export interface SkillModerationResponse {
  valid: boolean,
  reason: string,
  //visible: boolean;
  name?: string,
  canonName?: string
}