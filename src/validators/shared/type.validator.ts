export function validateManyRequiredParamerersType(parameters: any, type: string) {
  let ans = false;
  for (const key in parameters) {
    const parameter = parameters[key];
    ans = ans || (!parameter || typeof parameter !== type);
    if (ans) {
      break;
    }
  }
  return !ans;
}

export function validateOptionalParameterType(parameter: any, type: string) {
  const ans = ((parameter !== undefined) && (parameter !== null) && (typeof parameter !== type));
  return !ans;
}

export function parameterExists(parameter: any) {
  const ans = (!parameter);
  return !ans;
}

export function validateId(parameters: any) {
  const { id } = parameters;
  const parsedId = id ? parseInt(id as string, 10) : undefined;
  const ans = (!id || isNaN(parsedId!));
  return !ans;
}

export function validateNonObjectParameterType(parameter: any, type: string) {
  const ans = (!parameter || typeof parameter !== type);
  return !ans;
}

export function validateArrayParameterType(parameters: any[], type: string) {
  let ans = false;
  for (const parameter of parameters) {
    ans = ans || (typeof parameter !== type);
    if (ans) {
      break;
    }
  }
  return !ans;
}

export function validateEnum(parameters: any, enumValue: any) {
  const ans = (!Object.values(enumValue).includes(parameters));
  return !ans;
}