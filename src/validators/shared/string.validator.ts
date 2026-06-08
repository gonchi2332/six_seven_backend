import { profanity } from "../../config/leoprofanity.config";
import { uniqueWords, uniqueTrickyWords } from "../../utils/constants/array.constants";

export function validateStringMinLength (parameter: string, limit: number) {
  const ans = (parameter.length < limit);
  return !ans;
}

export function validateTrimedString(parameter: any) {
  const ans = (!parameter || typeof parameter !== "string" || parameter.trim().length === 0);
  return !ans;
}

export function isEmptyString(parameter: string) {
  const ans = (parameter.length === 0);
  return !ans;
}

export function validateStringMaxLength(parameter: string, limit: number) {
  const ans = (parameter.length > limit);
  return !ans;
}

export function stringLenghtNotEqualsTo(parameter: string, compareAmount: number) {
  const ans = (parameter.length != compareAmount);
  return !ans;
}

export function validateMultipleStringLenght(parameters: string[], min: number[], max: number[]) {
  let ans = false;
  const parametersLenght = parameters.length;
  for (let i = 0; i < parametersLenght - 1; i++) {
    ans = ans || (parameters[i].length < min[i] || parameters[i].length > max[i]);
    if (ans) {
      break;
    }
  }
  return !ans;
}

export function validateProfanityString(parameter: string) {
  const ans = (profanity.check(parameter) || containsBadWord(parameter, uniqueWords, uniqueTrickyWords));
  return !ans;
}

export function validateContentString(parameter: string, content: string) {
  const ans = (parameter.includes(content));
  return !ans;
}

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