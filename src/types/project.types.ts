export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectInfo {
  name: string;
  description: string;
  topic: string;
  role: string;
  //visible: boolean;
  status: string;
  links: ProjectLink[];
  imageBuffer?: Buffer;
}
