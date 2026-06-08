import { PoolClient } from "pg";
import { processReturnQuery, processTransaction } from "../utils/query.util";
import * as ProjectTypes from "../types/project.types";

/**
 * Verifica si un proyecto con el mismo nombre ya existe para un usuario.
 * @param {ProjectTypes.ProjectInfo} projectInfo - Datos del proyecto (nombre).
 * @param {string} username - Nombre de usuario.
 * @returns Promesa que resuelve a `true` si el proyecto existe, `false` en caso contrario.
 */
export async function projectExists(projectInfo: ProjectTypes.ProjectInfo, username: string) {
  const { name } = projectInfo;

  const checkQuery = `
    SELECT id FROM "project"
    WHERE name = $1 AND username = $2
  `;
  const values = [name, username];
  const foundProjects = await processReturnQuery(checkQuery, values);
  return !(foundProjects.length === 0);
}

/**
 * Crea un nuevo proyecto personal para un usuario en una transacción.
 * Inserta el proyecto y sus enlaces asociados en las tablas "project", "link" y "project_link".
 * @param {string} username - Nombre de usuario.
 * @param {ProjectTypes.ProjectInfo} projectInfo - Datos del proyecto y lista de enlaces.
 */
export async function createPersonalProject(username: string, projectInfo: ProjectTypes.ProjectInfo) {
  const { name, description, topic, status, role, imageBuffer, links } = projectInfo;

  await processTransaction(async (client: PoolClient) => {
    const projectQuery = `
      INSERT INTO "project" (name, description, topic, status, role, image, username, visible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const projectValues = [name, description, topic, status, role, imageBuffer, username, true];
    const projectRes = await client.query(projectQuery, projectValues);
    const projectId = projectRes.rows[0].id;

    for (const item of links) {
      const linkQuery = "INSERT INTO \"link\" (label, link) VALUES ($1, $2) RETURNING id";
      const linkRes = await client.query(linkQuery, [item.label, item.url]);
      const linkId = linkRes.rows[0].id;

      const projectLinkQuery = "INSERT INTO \"project_link\" (project_id, link_id) VALUES ($1, $2)";
      await client.query(projectLinkQuery, [projectId, linkId]);
    }
  });
}

/**
 * Busca un proyecto por su ID y nombre de usuario.
 * @param {string} username - Nombre de usuario.
 * @param {number} projectId - ID del proyecto.
 * @returns Promesa con el ID del proyecto si existe y pertenece al usuario.
 */
export async function getProjectByIdAndUser(username: string, projectId: number) {
  const selectQuery = `
    SELECT id FROM "project" 
    WHERE id = $1 AND username = $2
  `;
  const foundProject = await processReturnQuery(selectQuery, [projectId, username]);
  return foundProject;
}

/**
 * Actualiza un proyecto personal existente en una transacción.
 * Actualiza los datos básicos del proyecto y reemplaza todos sus enlaces.
 * @param {string} username - Nombre de usuario.
 * @param {number} projectId - ID del proyecto a actualizar.
 * @param {ProjectTypes.ProjectInfo} projectInfo - Datos actualizados del proyecto y nuevos enlaces.
 */
export async function updatePersonalProject(username: string, projectId: number, projectInfo: ProjectTypes.ProjectInfo) {
  const { description, topic, status, role, imageBuffer, links } = projectInfo;

  await processTransaction(async (client: PoolClient) => {
    if (imageBuffer) {
      const query = `
        UPDATE "project"
        SET description = $1, topic = $2, status = $3, role = $4, image = $5
        WHERE id = $6 AND username = $7
      `;
      await client.query(query, [description, topic, status, role, imageBuffer, projectId, username]);
    } else {
      const query = `
        UPDATE "project"
        SET description = $1, topic = $2, status = $3, role = $4
        WHERE id = $5 AND username = $6
      `;
      await client.query(query, [description, topic, status, role, projectId, username]);
    }
    const oldLinksQuery = "SELECT link_id FROM \"project_link\" WHERE project_id = $1";
    const oldLinksRes = await client.query(oldLinksQuery, [projectId]);
    const oldLinkIds = oldLinksRes.rows.map(r => r.link_id);
    if (oldLinkIds.length > 0) {
      await client.query("DELETE FROM \"project_link\" WHERE project_id = $1", [projectId]);
      await client.query("DELETE FROM \"link\" WHERE id = ANY($1::int[])", [oldLinkIds]);
    }
    for (const item of links) {
      const linkRes = await client.query("INSERT INTO \"link\" (label, link) VALUES ($1, $2) RETURNING id", [item.label, item.url]);
      const linkId = linkRes.rows[0].id;
      await client.query("INSERT INTO \"project_link\" (project_id, link_id) VALUES ($1, $2)", [projectId, linkId]);
    }
  });
}

/**
 * Elimina un proyecto personal y todos sus enlaces asociados en una transacción.
 * @param {number} projectId - ID del proyecto a eliminar.
 */
export async function deletePersonalProject(projectId: number) {
  await processTransaction(async (client: PoolClient) => {
    const oldLinksQuery = "SELECT link_id FROM \"project_link\" WHERE project_id = $1";
    const oldLinksRes = await client.query(oldLinksQuery, [projectId]);
    const oldLinkIds = oldLinksRes.rows.map(r => r.link_id);
    if (oldLinkIds.length > 0) {
      await client.query("DELETE FROM \"project_link\" WHERE project_id = $1", [projectId]);
      await client.query("DELETE FROM \"link\" WHERE id = ANY($1::int[])", [oldLinkIds]);
    }
    await client.query("DELETE FROM \"project\" WHERE id = $1", [projectId]);
  });
}

/**
 * Obtiene todos los proyectos públicos de un usuario, incluyendo sus enlaces.
 * Convierte la imagen binaria a formato base64.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con la lista de proyectos públicos formateados.
 */
export async function getPublicProjects(username: string) {
  const query = `
    SELECT 
      p.id, p.name, p.description, p.topic, p.status, p.role, p.image,
      COALESCE(json_agg(json_build_object('label', l.label, 'url', l.link)) FILTER (WHERE l.link IS NOT NULL), '[]') as links
    FROM "project" p
    LEFT JOIN "project_link" pl ON p.id = pl.project_id
    LEFT JOIN "link" l ON pl.link_id = l.id
    WHERE p.username = $1 AND p.visible = TRUE
    GROUP BY p.id
    ORDER BY p.id DESC
  `;
  const projectsFromDB = await processReturnQuery(query, [username]);
  const formattedProjects = projectsFromDB.map(proj => {
    let base64Image = null;
    if (proj.image) {
      base64Image = `data:image/jpeg;base64,${proj.image.toString("base64")}`;
    }
    return {
      id: proj.id,
      name: proj.name,
      description: proj.description,
      topic: proj.topic,
      status: proj.status,
      role: proj.role,
      links: proj.links,
      image: base64Image
    };
  });
  return formattedProjects;
}

/**
 * Obtiene todos los proyectos (públicos y privados) de un usuario, incluyendo sus enlaces.
 * Convierte la imagen binaria a formato base64.
 * @param {string} username - Nombre de usuario.
 * @returns Promesa con la lista completa de proyectos formateados.
 */
export async function getAllUserProjects(username: string) {
  const query = `
    SELECT 
      p.id, p.name, p.description, p.topic, p.status, p.role, p.image, p.visible,
      COALESCE(json_agg(json_build_object('label', l.label, 'url', l.link)) FILTER (WHERE l.link IS NOT NULL), '[]') as links
    FROM "project" p
    LEFT JOIN "project_link" pl ON p.id = pl.project_id
    LEFT JOIN "link" l ON pl.link_id = l.id
    WHERE p.username = $1
    GROUP BY p.id
    ORDER BY p.id DESC
  `;
  const projectsFromDB = await processReturnQuery(query, [username]);
  const formattedProjects = projectsFromDB.map(proj => {
    let base64Image = null;
    if (proj.image) {
      base64Image = `data:image/jpeg;base64,${proj.image.toString("base64")}`;
    }
    return {
      id: proj.id,
      name: proj.name,
      description: proj.description,
      topic: proj.topic,
      status: proj.status,
      role: proj.role,
      links: proj.links,
      image: base64Image,
      visible: proj.visible
    };
  });
  return formattedProjects;
}

/**
 * Actualiza la visibilidad de múltiples proyectos de forma masiva.
 * @param {string} username - Nombre de usuario.
 * @param {Record<string, boolean>} visibilities - Mapa de IDs y estados de visibilidad.
 */
export async function updateProjectsVisibilityBulk(username: string, visibilities: Record<string, boolean>) {
  const queries = Object.entries(visibilities).map(([id, isVisible]) => {
    const query = `
      UPDATE "project" 
      SET visible = $1 
      WHERE id = $2 AND username = $3
    `;
    const values = [isVisible, parseInt(id, 10), username];
    return processReturnQuery(query, values);
  });
  await Promise.all(queries);
}