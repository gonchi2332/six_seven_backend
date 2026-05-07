export const latinAlphabetRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const positionRegex = /^(?=.*[a-zA-Z])[a-zA-Z\s-]+$/;
export const companyRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.\-&]+$/;

export const repeatedLettersRegex = /(.)\1{3,}/;
export const onlyNumbersRegex = /^[0-9]+$/;