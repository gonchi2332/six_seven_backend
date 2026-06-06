import * as RegexConstants from "../utils/constants/regex.constants";

export function containsBadWord(text: string, badWords: string[], trickyWords: string[]) {
  const words = text
    .toLowerCase()  
    .replace(/[_\-.\s]+/g, " ")
    .trim()
    .split(" ");
  
  const filteredBadWords = words.filter(word => !trickyWords.includes(word));
  const filteredBadWordText = filteredBadWords.join("");

  return badWords.some(word => filteredBadWordText.includes(word));
}

export function isGarbageInput(text: string) {
  return (RegexConstants.repeatedLettersRegex.test(text) || RegexConstants.onlyNumbersRegex.test(text));
}