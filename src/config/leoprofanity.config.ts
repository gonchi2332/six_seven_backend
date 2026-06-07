import { uniqueWords } from "../utils/constants/array.constants";
import LeoProfanity from "leo-profanity";

LeoProfanity.loadDictionary("en");
LeoProfanity.loadDictionary("es");

LeoProfanity.add(uniqueWords);

export const profanity = LeoProfanity;