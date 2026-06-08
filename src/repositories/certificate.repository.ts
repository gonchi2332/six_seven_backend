import { processReturnQuery } from "../utils/query.util";
import * as CertificateTypes from "../types/certificate.types";

export async function certificateExists(
  certificateInfo: CertificateTypes.CertificateInfo,
  username: string) {
  const { title, area } = certificateInfo;

  const checkQuery = `
    SELECT id FROM "certificate"
    WHERE title = $1 AND area = $2 AND username = $3
  `;
  const values = [title, area, username];
  const foundCertificates = await processReturnQuery(checkQuery, values);
  return !(foundCertificates.length === 0);
}

export async function getUserCertificate(username: string, id: number) {
  const selectQuery = `
    SELECT id, title, description, area, issue_date, visible FROM "certificate"
    WHERE id = $1 AND username = $2
  `;
  const foundCertificate = await processReturnQuery(selectQuery, [id, username]);
  return foundCertificate;
}

export async function createCertificate(
  username: string,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImageBuffer: Express.Multer.File ) {
  const { title, description, area, issueDate } = certificateInfo;
  
  const insertQuery = `
    INSERT INTO "certificate" (title, description, area, issue_date, file, username, visible)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [title, description, area, issueDate, coverImageBuffer.buffer, username, true];
  await processReturnQuery(insertQuery, values);
}

export async function updateCertificate(
  username: string,
  certificateInfo: CertificateTypes.CertificateInfo,
  coverImage: Express.Multer.File,
  id: number) {
  const { description, area, issueDate } = certificateInfo;

  const setParts: string[] = [];
  const values: unknown[] = [];
  let placeholderIndex = 1;
  if (description) {
    setParts.push(`description = $${placeholderIndex++}`);
    values.push(description);
  }
  if (area) {
    setParts.push(`area = $${placeholderIndex++}`);
    values.push(area);
  }
  if (coverImage) {
    setParts.push(`file = $${placeholderIndex++}`);
    values.push(coverImage);
  }
  if (issueDate) {
    setParts.push(`issue_date = $${placeholderIndex++}`);
    values.push(issueDate);
  }
  setParts.push(`username = $${placeholderIndex++}`);
  values.push(username);
  setParts.push(`visible = $${placeholderIndex++}`);
  values.push(true);

  values.push(id);
  const whereQuery = `WHERE id = $${placeholderIndex}`;
  const updateQuery = `UPDATE "certificate" 
                       SET ${setParts.join(", ")}
                       ${whereQuery}`;
  await processReturnQuery(updateQuery, values);
}

export async function getAllPublicUserCertificates(username: string) {
  const selectQuery = `
    SELECT id, title, description, area, file, issue_date, visible 
    FROM "certificate"
    WHERE username = $1 AND visible = true
  `;
  const userCertificates = await processReturnQuery(selectQuery, [username]);
  const formatedCertificates = userCertificates.map(cert => {
    let base64File = null;
    if (cert.file) {
      base64File = `data:image/jpeg;base64,${cert.file.toString("base64")}`;
    }
    return {
      id: cert.id,
      title: cert.title,
      description: cert.description,
      area: cert.area,
      issue_date: cert.issue_date,
      visible: cert.visible,
      file: base64File
    };
  });
  return formatedCertificates;
}

export async function getAllUserCertificates(username: string) {
  const selectQuery = `
    SELECT id, title, description, area, file, issue_date, visible FROM "certificate"
    WHERE username = $1
  `;
  const userCertificates = await processReturnQuery(selectQuery, [username]);
  const formatedCertificates = userCertificates.map(cert => {
    let base64File = null;
    if (cert.file) {
      base64File = `data:image/jpeg;base64,${cert.file.toString("base64")}`;
    }
    return {
      id: cert.id,
      title: cert.title,
      description: cert.description,
      area: cert.area,
      issue_date: cert.issue_date,
      visible: cert.visible,
      file: base64File
    };
  });
  return formatedCertificates;
}

export async function deleteUserCertificate(username: string, id: number) {
  const deleteQuery = `
    DELETE FROM "certificate"
    WHERE id = $1 AND username = $2
    RETURNING title
  `;
  const deletedCertificate = await processReturnQuery(deleteQuery, [id, username]);
  return deletedCertificate;
}

export async function updateCertificatesVisibilityBulk(username: string, visibilities: Record<string, boolean>) {
  const queries = Object.entries(visibilities).map(([id, isVisible]) => {
    const query = `
      UPDATE "certificate" 
      SET visible = $1 
      WHERE id = $2 AND username = $3
    `;
    const values = [isVisible, parseInt(id, 10), username];
    
    return processReturnQuery(query, values); 
  });
  await Promise.all(queries);
}