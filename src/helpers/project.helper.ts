import * as ProjectTypes from "../types/project.types";

async function commonProjectValidations(projectInfo: ProjectTypes.ProjectInfo) {
  const { description, status, topic, role, links } = projectInfo;
  if (!description || typeof description !== "string" || description.trim() === "") {
    return {
      result: false,
      messageState: "La descripción es requerida"
    };
  }
  if (description.length > 200) {
    return {
      result: false,
      messageState: "La descripción supera el límite de 200 caracteres."
    };
  }
  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return {
      result: false,
      messageState: "El área es requerida"
    };
  }
  if (!role || typeof role !== "string" || role.trim() === "") {
    return {
      result: false,
      messageState: "El rol es requerido"
    };
  }
  if (role.length > 50) {
    return {
      result: false,
      messageState: "El rol supera el límite de 50 caracteres."
    };
  }
  const validStatuses = ["En proceso", "Finalizado", "Cancelado"];
  if (!status || !validStatuses.includes(status)) {
    return {
      result: false,
      messageState: "Estado del proyecto inválido."
    };
  }
  if (!links || !Array.isArray(links) || links.length === 0) {
    return {
      result: false,
      messageState: "Al menos un enlace es requerido"
    };
  }
  if (links.length > 2) {
    return {
      result: false,
      messageState: "Solo se permiten un máximo de 2 enlaces."
    };
  }
  const domainRegex = /^((https?:\/\/)?(www\.)?)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/;
  for (const link of links) {
    if (!domainRegex.test(link)) {
      return {
        result: false,
        messageState: `El enlace '${link}' no cumple con el formato válido (dominio.extension).`
      };
    }
  }
  return {
    result: true,
    messageState: "Validación exitosa"
  };
}

export async function registerProjectValidations(projectInfo: ProjectTypes.ProjectInfo) {
  const { name } = projectInfo;
  if (!name || typeof name !== "string" || name.trim() === "") {
    return {
      result: false,
      messageState: "El nombre del proyecto es requerido"
    };
  }
  if (name.length > 50) {
    return {
      result: false,
      messageState: "El nombre del proyecto supera el límite de 50 caracteres."
    };
  }
  return await commonProjectValidations(projectInfo);
}

export async function modifyProjectValidations(projectInfo: ProjectTypes.ProjectInfo) {
  return await commonProjectValidations(projectInfo);
}
