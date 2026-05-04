const trickyWords = ["calculo", "analisis"];

export function containsBadWord(text: string, badWords: string[]) {
  const words = text
    .toLowerCase()  
    .replace(/[_\-.\s]+/g, " ")
    .trim()
    .split(" ");
  
  const filteredBadWords = words.filter(word => !trickyWords.includes(word));
  const filteredBadWordText = filteredBadWords.join("");

  return badWords.some(word => filteredBadWordText.includes(word));
}