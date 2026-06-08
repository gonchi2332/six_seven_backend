import { processReturnQuery } from "../utils/query.util";

export async function findPlatforms(platfomName: string) {
  const platformQuery = `
    SELECT id FROM "external_platform" 
    WHERE name = $1
  `;
  return await processReturnQuery(platformQuery, [platfomName]);
}

export async function insertOrUpdatePlatform(platformId: number, username: string, linkedinUsername: string) {
  const upsertQuery = `
    INSERT INTO "user_platform" (external_platform_id, username, link, visit_count)
    VALUES ($1, $2, $3, 0)
    ON CONFLICT (username, external_platform_id) 
    DO UPDATE SET link = EXCLUDED.link;
  `;
  return await processReturnQuery(upsertQuery, [platformId, username, linkedinUsername]);
}

export async function findUserPlatform(username: string, platfomName: string) {
  const getQuery = `
    SELECT up.link
    FROM "user_platform" up
    JOIN "external_platform" ep ON up.external_platform_id = ep.id
    WHERE up.username = $1 AND ep.name = $2
  `;
  return await processReturnQuery(getQuery, [username, platfomName]);
}