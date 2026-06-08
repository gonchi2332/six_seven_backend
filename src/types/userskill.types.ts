export interface RegisterNewUserSkillInfo {
  skillName: string;
  punctuation?: number;
}

export interface ModifyUserSkillInfo {
  skillName: string;
  newPunctuation: number;
}

export interface DeleteUserSkillInfo {
  skillName: string;
}

export interface UpdateSkillVisibilityInfo {
  visibilities: Record<string, boolean>;
}