import * as fs from "fs";
import * as path from "path";

const sugestTechnologies = fs.readFileSync(path.join(__dirname, "../../resources/ai/techs.txt"), "utf-8");
const formatedTechs = sugestTechnologies
  .split("\n")
  .map(t => t.trim().toLowerCase())
  .filter(t => t.length > 0);
const uniqueTechs = [...new Set(formatedTechs)];
export const techs = uniqueTechs.join(", ");