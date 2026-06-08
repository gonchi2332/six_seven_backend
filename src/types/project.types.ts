export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectInfo {
  name: string;
  description: string;
  topic: string;
  role: string;
  status: string;
  links: ProjectLink[];
  imageBuffer?: Buffer;
}

export interface UpdateProjectsVisibilityInfo {
  visibilities: Record<string, boolean>;
}