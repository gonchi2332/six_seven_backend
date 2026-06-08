export const latinAlphabetRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+?[-\d\s()]{7,15}$/;

export const positionRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;
export const titleRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/;
export const companyRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.\-&]+$/;
export const institutionRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.\-&]+$/;

export const certificateTitleRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.-]+$/;
export const areaRegex = /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;

export const repeatedLettersRegex = /(.)\1{3,}/;
export const onlyNumbersRegex = /^[0-9]+$/;

export const domainRegex = /^((https?:\/\/)?(www\.)?)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/;