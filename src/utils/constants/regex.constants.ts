/** Expresión regular para validar caracteres del alfabeto latino y tildes. */
export const latinAlphabetRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

/** Expresión regular para validar correos electrónicos. */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Expresión regular para validar números de teléfono internacionales. */
export const phoneRegex = /^\+?[-\d\s()]{7,15}$/;

/** Expresión regular para validar nombres de puestos de trabajo. */
export const positionRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;
/** Expresión regular para validar títulos académicos. */
export const titleRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/;
/** Expresión regular para validar nombres de empresas. */
export const companyRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.\-&]+$/;
/** Expresión regular para validar nombres de instituciones. */
export const institutionRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.\-&]+$/;

/** Expresión regular para validar títulos de certificados. */
export const certificateTitleRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.-]+$/;
/** Expresión regular para validar áreas de conocimiento. */
export const areaRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;

/** Expresión regular para detectar letras repetidas más de 3 veces consecutivas. */
export const repeatedLettersRegex = /(.)\1{3,}/;
/** Expresión regular para validar cadenas que solo contienen números. */
export const onlyNumbersRegex = /^[0-9]+$/;

/** Expresión regular para validar dominios y URLs. */
export const domainRegex = /^((https?:\/\/)?(www\.)?)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/;