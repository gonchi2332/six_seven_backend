export const latinAlphabetRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const positionRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;
export const titleRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/;
export const companyRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.\-&]+$/;
export const institutionRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.\-&]+$/;

export const repeatedLettersRegex = /(.)\1{3,}/;
export const onlyNumbersRegex = /^[0-9]+$/;