export interface ProjectInfo {
  name: string;
  description: string;
  topic: string;
  role: string;
  //visible: boolean;
  status: string;
  links: string[];
  imageBuffer?: Buffer;
}
