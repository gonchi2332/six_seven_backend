import * as fs from "fs";
import * as path from "path";

/* Carga y procesamiento de diccionarios de palabras ofensivas en varios idiomas. */
const spanishBadWords = fs.readFileSync(path.join(__dirname, "../../resources/profanity/ESP.txt"), "utf-8");
const mexicanBadWords = fs.readFileSync(path.join(__dirname, "../../resources/profanity/MEX.txt"), "utf-8");
const argentinianBadWords = fs.readFileSync(path.join(__dirname, "../../resources/profanity/ARG.txt"), "utf-8");
const bolivianBadWords = fs.readFileSync(path.join(__dirname, "../../resources/profanity/BOL.txt"), "utf-8");
const englishBadWords = fs.readFileSync(path.join(__dirname, "../../resources/profanity/ENG.txt"), "utf-8");
const batchBadWords = [spanishBadWords, mexicanBadWords, argentinianBadWords, bolivianBadWords, englishBadWords];
let words: string[] = [];
for (const badWords of batchBadWords) {
  const formatedBadWords = badWords
    .split("\n")
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0);

  words = words.concat(formatedBadWords);
}
/** Lista única de palabras ofensivas cargadas desde archivos de recursos. */
export const uniqueWords = [...new Set(words)];

/* Carga de palabras "engañosas" o de difícil detección. */
const trickyWords = fs.readFileSync(path.join(__dirname, "../../resources/profanity/trickywords.txt"), "utf-8");
const formatedTrickyWords = trickyWords
  .split("\n")
  .map(w => w.trim().toLowerCase())
  .filter(w => w.length > 0);
/** Lista única de palabras engañosas. */
export const uniqueTrickyWords = [...new Set(formatedTrickyWords)];

/* Carga de tecnologías sugeridas para validación por IA. */
const sugestTechnologies = fs.readFileSync(path.join(__dirname, "../../resources/ai/techs.txt"), "utf-8");
const formatedTechs = sugestTechnologies
  .split("\n")
  .map(t => t.trim().toLowerCase())
  .filter(t => t.length > 0);
const uniqueTechs = [...new Set(formatedTechs)];
/** Cadena de texto con tecnologías separadas por coma para prompts de IA. */
export const techs = uniqueTechs.join(", ");

/** Palabras clave comunes encontradas en certificados para validación de contenido. */
export const certificateWords = [
  "certificado", "certificate", "diploma", "título", "constancia",
  "certifica", "certifies", "awarded", "completed", "aprobado",
  "otorgado", "reconoce", "acredita", "graduado", "egresado",
  "verificado", "verified", "award"
];

/** Traducción de nombres de días de la semana de inglés a español. */
export const DIAS_ES: Record<string, string> = {
  "Monday": "Lunes", "Tuesday": "Martes", "Wednesday": "Miércoles", "Thursday": "Jueves",
  "Friday": "Viernes", "Saturday": "Sábado", "Sunday": "Domingo"
};

/** Traducción de nombres de meses del año de inglés a español. */
export const MESES_ES: Record<string, string> = {
  "January": "Enero", "February": "Febrero", "March": "Marzo", "April": "Abril",
  "May": "Mayo", "June": "Junio", "July": "Julio", "August": "Agosto",
  "September": "Septiembre", "October": "Octubre", "November": "Noviembre", "December": "Diciembre"
};