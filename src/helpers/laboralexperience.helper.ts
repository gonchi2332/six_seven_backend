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