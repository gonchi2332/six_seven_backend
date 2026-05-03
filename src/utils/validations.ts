export function containsBadWord(text: string, badWords: string[]) {
  const formatedText = text
    .toLowerCase()  
    .replace(/[_\-.\s]/g, "");
  return badWords.some(word => formatedText.includes(word));
}