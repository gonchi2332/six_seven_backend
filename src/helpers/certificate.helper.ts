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