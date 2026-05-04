export enum SkillType {
  HARDSKILL = "hard",
  SOFTSKILL = "soft"
}

export interface SkillModerationResponse {
  valid: boolean,
  reason: string,
  name?: string,
  canonName?: string
}