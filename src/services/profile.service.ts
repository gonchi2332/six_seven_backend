import "../config/env.config";
import crypto from "crypto";
import { processReturnQuery } from "../utils/processQuery";

export async function getOrCreatePublicLink(username: string) {
  try {
    const checkQuery = `
      SELECT username FROM "user"
      WHERE username = $1
    `;
    const userFounded = await processReturnQuery(checkQuery, [username]);
    if (userFounded.length === 0) {
      return {
        result: false,
        messageState: "Usuario no encontrado."
      };
    }
    let values = [username];
    const querySelect = "SELECT public_profile_link FROM \"user\" WHERE username = $1";
    const userPublicLink = await processReturnQuery(querySelect, values);

    const profilelink = userPublicLink[0].public_profile_link;
    const baseUrl = `http://localhost:${process.env.PORT}`;

    if (profilelink) {
      return {
        result: true,
        messageState: `Enlace de perfil publico de ${username} correctamente obtenida.`,
        publicProfileLink:  `${baseUrl}/profile/${profilelink}`,
      };
    }

    const hash = crypto.randomBytes(3).toString("hex");
    const cleanUsername = username.toLowerCase().replace(/\s+/g, "_");
    const publicLink = `${hash}/${cleanUsername}`;

    const queryUpdate = "UPDATE \"user\" SET public_profile_link = $1 WHERE username = $2";
    values = [publicLink, username];
    await processReturnQuery(queryUpdate, values);
    return {
      result: true,
      messageState: "Enlace de perfil publico de ${username} correctamente obtenida.",
      publicProfileLink: `${baseUrl}/profile/${publicLink}`
    };
  }

  catch (err) {
    return {
      result: false,
      messageState: `Error al acceder a link del enlace publico: ${(err as Error).message}`
    };
  }
}