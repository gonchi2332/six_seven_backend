export function validateObjectArray(parameters: any) {
  const ans = (!parameters || typeof parameters !== "object" || Array.isArray(parameters));
  return !ans;
}

export function validateEmptyArray(parameters: any) {
  const ans = (!parameters || parameters.length === 0);
  return !ans;
}

export function validateArrayContent(parameter: any, content: any[]) {
  const ans = (!parameter || !content.includes(parameter));
  return !ans;
}

export function validateArray(parameters: any) {
  const ans = (!parameters || !Array.isArray(parameters) || parameters.length === 0);
  return !ans;
}