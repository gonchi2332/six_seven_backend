export function registerDateValidations(startDateStr: Date) {
  const startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) {
    return {
      result: false,
      messageState: "El año de inicio es inválido."
    };  }
  if (!isWithinLast100Years(startDate)) {
    return {
      result: false,
      messageState: "El año de inicio tiene que estar dentro del rango de hoy y hace 100 años"
    };
  }
}

export function updateDateValidations(
  newStartDateStr?: Date | null) {
  if (newStartDateStr) {
    const validationResult = registerDateValidations(newStartDateStr);
    if (validationResult && !validationResult.result) {
      return {
        result: false,
        messageState: validationResult.messageState
      };
    }
  }
}

function isWithinLast100Years(targetDate: Date) {
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

  return targetDate > hundredYearsAgo && targetDate <= new Date();
}