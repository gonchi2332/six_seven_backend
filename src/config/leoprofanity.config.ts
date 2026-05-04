import * as fs from "fs";
import * as path from "path";
import LeoProfanity from "leo-profanity";

LeoProfanity.loadDictionary("en");
LeoProfanity.loadDictionary("es");

const spanishBadWords = fs.readFileSync(path.join(__dirname, "../resources/ESP.txt"), "utf-8");
const mexicanBadWords = fs.readFileSync(path.join(__dirname, "../resources/MEX.txt"), "utf-8");
const argentinianBadWords = fs.readFileSync(path.join(__dirname, "../resources/ARG.txt"), "utf-8");
const bolivianBadWords = fs.readFileSync(path.join(__dirname, "../resources/BOL.txt"), "utf-8");
const englishBadWords = fs.readFileSync(path.join(__dirname, "../resources/ENG.txt"), "utf-8");

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

LeoProfanity.add(uniqueWords);
export const profanity = LeoProfanity;