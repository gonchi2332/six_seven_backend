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