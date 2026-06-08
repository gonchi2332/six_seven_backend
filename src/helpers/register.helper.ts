/**
 * Devuelve las palabras descriptivas para una acción de registro o actualización de perfil.
 * @param {"register" | "update"} type - Tipo de acción.
 * @returns {Object} Objeto con `singleWord` (infinitivo) y `pastWord` (participio).
 */
export function getRegisterAction(type: "register" | "update") {
  const types = {
    register: {
      singleWord: "registrar",
      pastWord: "registrado"
    },
    update: {
      singleWord: "modificar",
      pastWord: "modificado"
    }
  };
  return types[type];
}