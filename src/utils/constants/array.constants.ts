import * as fs from "fs";
import * as path from "path";

const spanishBadWords = fs.readFileSync(path.join(__dirname, "../resources/profanity/ESP.txt"), "utf-8");
const mexicanBadWords = fs.readFileSync(path.join(__dirname, "../resources/profanity/MEX.txt"), "utf-8");
const argentinianBadWords = fs.readFileSync(path.join(__dirname, "../resources/profanity/ARG.txt"), "utf-8");
const bolivianBadWords = fs.readFileSync(path.join(__dirname, "../resources/profanity/BOL.txt"), "utf-8");
const englishBadWords = fs.readFileSync(path.join(__dirname, "../resources/profanity/ENG.txt"), "utf-8");
const batchBadWords = [spanishBadWords, mexicanBadWords, argentinianBadWords, bolivianBadWords, englishBadWords];
let words: string[] = [];
for (const badWords of batchBadWords) {
  const formatedBadWords = badWords
    .split("\n")
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0);

  words = words.concat(formatedBadWords); 
}
export const uniqueWords = [...new Set(words)];

const trickyWords = fs.readFileSync(path.join(__dirname, "../resources/profanity/trickywords.txt"), "utf-8");
const formatedTrickyWords = trickyWords
  .split("\n")
  .map(w => w.trim().toLowerCase())
  .filter(w => w.length > 0);
export const uniqueTrickyWords = [...new Set(formatedTrickyWords)];

const sugestTechnologies = fs.readFileSync(path.join(__dirname, "../../resources/ai/techs.txt"), "utf-8");
const formatedTechs = sugestTechnologies
  .split("\n")
  .map(t => t.trim().toLowerCase())
  .filter(t => t.length > 0);
const uniqueTechs = [...new Set(formatedTechs)];
export const techs = uniqueTechs.join(", ");

export const certificateWords = [
  "certificado", "certificate", "diploma", "título", "constancia",
  "certifica", "certifies", "awarded", "completed", "aprobado",
  "otorgado", "reconoce", "acredita", "graduado", "egresado",
  "verificado", "verified", "award"
];