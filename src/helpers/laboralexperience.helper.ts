/**
 * Devuelve las palabras descriptivas para una acción sobre registros de experiencia laboral.
 * @param {"register" | "modify"} type - Tipo de acción.
 * @returns {Object} Objeto con `singleWord` y `pluralWord`.
 */
export function getLaboralExpAction(type: "register" | "modify") {
  const types = {
    register: {
      singleWord: "registrada",
      pluralWord: "registradas"
    },
    modify: {
      singleWord: "modificada",
      pluralWord: "modificadas"
    }
  };
  return types[type];
}