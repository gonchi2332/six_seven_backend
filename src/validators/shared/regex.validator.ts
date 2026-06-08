import * as RegexConstants from "../../utils/constants/regex.constants";

/**
 * Valida el formato de un correo electrónico.
 * @param {string} email - Correo a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateEmailFormat(email: string) {
  const ans = (!RegexConstants.emailRegex.test(email));
  return !ans;
}

/**
 * Valida el formato del título de un certificado.
 * @param {string} title - Título a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateCertificateTitleFormat(title: string) {
  const ans = (!RegexConstants.certificateTitleRegex.test(title));
  return !ans;
}

/**
 * Valida el formato del área de un certificado.
 * @param {string} area - Área a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateCertificateAreaFormat(area: string) {
  const ans = (!RegexConstants.areaRegex.test(area));
  return !ans;
}

/**
 * Valida el formato de un título académico.
 * @param {string} title - Título a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateEducationTitleFormat(title: string) {
  const ans = (!RegexConstants.titleRegex.test(title));
  return !ans;
}

/**
 * Valida el formato del nombre de una institución educativa.
 * @param {string} institution - Institución a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateEducationInstitutionFormat(institution: string) {
  const ans = (!RegexConstants.institutionRegex.test(institution));
  return !ans;
}

/**
 * Valida el formato de un cargo o posición laboral.
 * @param {string} position - Cargo a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateWorkPositionFormat(position: string) {
  const ans = (!RegexConstants.positionRegex.test(position));
  return !ans;
}

/**
 * Valida el formato del nombre de una empresa.
 * @param {string} company - Empresa a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateWorkCompanyFormat(company: string) {
  const ans = (!RegexConstants.companyRegex.test(company));
  return !ans;
}

/**
 * Valida el formato de un dominio o URL.
 * @param {string} link - URL a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateDomainFormat(link: string) {
  const ans = (!RegexConstants.domainRegex.test(link));
  return !ans;
}

/**
 * Valida el formato de un número de teléfono.
 * @param {string} phone - Teléfono a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validatePhoneFormat(phone: string) {
  const ans = (!RegexConstants.phoneRegex.test(phone));
  return !ans;
}

/**
 * Valida si una cadena solo contiene caracteres del alfabeto latino y tildes.
 * @param {string} skillName - Cadena a validar.
 * @returns {boolean} True si el formato es válido, False en caso contrario.
 */
export function validateLatinAlphabetFormat(skillName: string) {
  const ans = (!RegexConstants.latinAlphabetRegex.test(skillName));
  return !ans;
}

/**
 * Detecta si una entrada de texto parece ser "basura" (letras repetidas o solo números).
 * @param {string} text - Texto a analizar.
 * @returns {boolean} True si es entrada basura, False en caso contrario.
 */
export function isGarbageInput(text: string) {
  return (RegexConstants.repeatedLettersRegex.test(text) || RegexConstants.onlyNumbersRegex.test(text));
}