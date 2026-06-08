/**
 * Valida que todos los valores de un objeto sean de un tipo específico.
 * @param {any} parameters - Objeto con los parámetros a validar.
 * @param {string} type - Tipo de dato esperado (ej. 'string', 'number').
 * @returns {boolean} True si todos cumplen el tipo, False si alguno falla o es nulo.
 */
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

/**
 * Valida el tipo de un parámetro opcional. Si existe, debe ser del tipo especificado.
 * @param {any} parameter - Valor a validar.
 * @param {string} type - Tipo de dato esperado.
 * @returns {boolean} True si no existe o si cumple el tipo, False si existe y no cumple el tipo.
 */
export function validateOptionalParameterType(parameter: any, type: string) {
  const ans = ((parameter !== undefined) && (parameter !== null) && (typeof parameter !== type));
  return !ans;
}

/**
 * Valida si un parámetro existe (no es nulo o indefinido).
 * @param {any} parameter - Valor a verificar.
 * @returns {boolean} True si existe, False en caso contrario.
 */
export function parameterExists(parameter: any) {
  const ans = (!parameter);
  return !ans;
}

/**
 * Valida si un objeto contiene un ID numérico válido.
 * @param {any} parameters - Objeto que debe contener la propiedad `id`.
 * @returns {boolean} True si el ID es válido, False en caso contrario.
 */
export function validateId(parameters: any) {
  const { id } = parameters;
  const parsedId = id ? parseInt(id as string, 10) : undefined;
  const ans = (!id || isNaN(parsedId!));
  return !ans;
}

/**
 * Valida el tipo de un parámetro que no es un objeto.
 * @param {any} parameter - Valor a validar.
 * @param {string} type - Tipo de dato esperado.
 * @returns {boolean} True si cumple el tipo y existe, False en caso contrario.
 */
export function validateNonObjectParameterType(parameter: any, type: string) {
  const ans = (!parameter || typeof parameter !== type);
  return !ans;
}

/**
 * Valida que todos los elementos de un array sean de un tipo específico.
 * @param {any[]} parameters - Array de valores.
 * @param {string} type - Tipo de dato esperado.
 * @returns {boolean} True si todos cumplen el tipo, False si alguno falla.
 */
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

/**
 * Valida si un valor pertenece a un conjunto de valores de un Enum.
 * @param {any} parameters - Valor a validar.
 * @param {any} enumValue - Objeto Enum contra el cual validar.
 * @returns {boolean} True si el valor pertenece al Enum, False en caso contrario.
 */
export function validateEnum(parameters: any, enumValue: any) {
  const ans = (!Object.values(enumValue).includes(parameters));
  return !ans;
}

/**
 * Valida la estructura básica del payload de un token (presencia de username).
 * @param {any} token - Payload del token decodificado.
 * @returns {boolean} True si el payload es válido, False en caso contrario.
 */
export function validateTokenPayload(token: any) {
  return !!token?.username && typeof token.username === "string";
}