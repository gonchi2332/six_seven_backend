import { getClient } from "../config/database.config";
import { PoolClient } from "pg";

/**
 * Ejecuta una consulta SQL simple y devuelve las filas resultantes.
 * Se encarga de obtener y liberar el cliente de la base de datos.
 * @param {string} queryString - Consulta SQL a ejecutar.
 * @param {unknown[]} values - Valores para los parámetros de la consulta.
 * @returns {Promise<any[]>} Promesa con el array de filas resultantes.
 */
export async function processReturnQuery(queryString: string, values: unknown[]) {
  const client = await getClient();
  try {
    const result = await client.query(queryString, values);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Ejecuta una serie de operaciones dentro de una transacción SQL (BEGIN/COMMIT/ROLLBACK).
 * @template T
 * @param {Function} callback - Función que contiene las operaciones a realizar con el cliente.
 * @returns {Promise<T>} Promesa con el resultado de la función callback.
 * @throws Error si ocurre algún problema durante la transacción, provocando un ROLLBACK.
 */
export async function processTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}