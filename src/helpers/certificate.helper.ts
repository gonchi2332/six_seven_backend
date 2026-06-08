/**
 * Devuelve las palabras descriptivas (singular y plural) para una acción sobre certificados.
 * Útil para generar mensajes de respuesta consistentes.
 * @param {"register" | "modify" | "view" | "delete"} type - Tipo de acción realizada.
 * @returns {Object} Objeto con `singleWord` y `pluralWord` en español.
 */
export function getCertificateAction(type: "register" | "modify" | "view" | "delete") {
  const types = {
    register: {
      singleWord: "registrado",
      pluralWord: "registrados"
    },
    modify: {
      singleWord: "modificado",
      pluralWord: "modificados"
    },
    view: {
      singleWord: "obtenido",
      pluralWord: "obtenidos"
    },
    delete: {
      singleWord: "eliminado",
      pluralWord: "eliminados"
    }
  };
  return types[type];
}