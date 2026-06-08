import { randomInt } from "crypto";

const codeLenght = 8;

export function generateCode() {
  let code = "";
  let digit;
  for (let i = 0; i <= codeLenght - 1; i++) {
    digit = randomInt(0, 6);
    code += digit.toString();
  }
  return code;
}