/**
 * Devuelve las palabras descriptivas para una acción sobre registros de educación.
 * @param {"register" | "modify"} type - Tipo de acción.
 * @returns {Object} Objeto con `singleWord` y `pluralWord`.
 */
export function getEducationAction(type: "register" | "modify") {
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

/**
 * Normaliza y formatea un título académico para comparaciones o almacenamiento.
 * Elimina caracteres especiales, normaliza espacios y convierte a minúsculas.
 * @param {string} title - Título a formatear.
 * @returns {Promise<string>} Título formateado.
 */
export async function formatAcademicInfo(title: string) {
  return title
    .trim()
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}