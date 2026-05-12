export function registerDateValidations(startDateStr: Date, endDateStr?: Date | string | null) {
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
  if (endDateStr) {
    const endDate = new Date(endDateStr);
    if (isNaN((endDate as Date).getTime())) {
      return {
        result: false,
        messageState: "El año de finalización es inválido"
      };
    }
    if (!isWithinLast100Years(endDate)) {
      return {
        result: false,
        messageState: "La fecha de finalización tiene que estar dentro del rango de hoy y hace 100 años"
      };
    }
    if (startDate > endDate) {
      return {
        result: false,
        messageState: "El año de inicio no puede ser antes del año de finalización"
      };
    }
  }
}

export function updateDateValidations(
  oldStartDateStr: Date, oldEndDateStr: Date | null,
  newStartDateStr?: Date | null, newEndDateStr?: Date | null) {
  const oldStartDate = new Date(oldStartDateStr);
  if (newStartDateStr) {
    const validationResult = registerDateValidations(newStartDateStr, newEndDateStr);
    if (validationResult && !validationResult.result) {
      return {
        result: false,
        messageState: validationResult.messageState
      };
    }
    const newStartDate = new Date(newStartDateStr);
    if (oldEndDateStr) {
      const oldEndDate = new Date(oldEndDateStr);

      if (newStartDate > oldEndDate) {
        return {
          result: false,
          messageState: "El año de inicio no puede ser despues del año de finalización"
        };
      }
    }
  }
  if (newEndDateStr && !newStartDateStr) {
    const newEndDate = new Date(newEndDateStr);
    if (!isWithinLast100Years(newEndDate)) {
      return {
        result: false,
        messageState: "El año de finalización tiene que estar dentro del rango de hoy y hace 100 años"
      };
    }
    if (oldStartDate > newEndDate) {
      return {
        result: false,
        messageState: "El año de finalización no puede ser antes del año de inicio"
      };
    }
  }
}

function isWithinLast100Years(targetDate: Date) {
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

  return targetDate > hundredYearsAgo && targetDate <= new Date();
}