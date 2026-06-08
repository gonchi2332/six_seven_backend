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

export async function formatAcademicInfo(title: string) {
  return title
    .trim()
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
    .replace(/\s+/g, " ")                          
    .toLowerCase();
}