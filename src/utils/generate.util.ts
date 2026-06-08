import { randomInt } from "crypto";

const codeLenght = 8;

/**
 * Genera un código numérico aleatorio de longitud fija (8 dígitos).
 * Utiliza `crypto.randomInt` para asegurar una generación segura.
 * @returns {string} Código numérico de 8 dígitos como cadena.
 */
export function generateCode() {
  let code = "";
  let digit;
  for (let i = 0; i <= codeLenght - 1; i++) {
    digit = randomInt(0, 6);
    code += digit.toString();
  }
  return code;
}