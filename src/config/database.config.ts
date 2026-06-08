import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

/*Esta línea de código utiliza la biblioteca `dotenv` para cargar variables de entorno desde un archivo `.env`
en el objeto `process.env` de Node.js. */
dotenv.config({ path: path.join(process.cwd(), ".env") });

/**
 *La función `getConectionString` devuelve la cadena de conexión de base de datos apropiada según la
 *entorno (de producción o local).
 *@returns La función `getConectionString` devuelve la cadena de conexión de la base de datos según el
 *entorno. Si `NODE_ENV` está configurado en "producción", devuelve el valor de `DB_URL` del
 *variables de entorno. De lo contrario, devuelve el valor de `LOCAL_DB_URL`.
 */
export function getConectionString() {
  const connectionString = process.env.NODE_ENV === "production" ? process.env.DB_URL : process.env.LOCAL_DB_URL;
  return connectionString;
}

/*Este fragmento de código crea una nueva instancia de un objeto `Pool` de la biblioteca `pg`, que se utiliza
para administrar un grupo de conexiones de clientes PostgreSQL. El constructor `Pool` se está inicializando
con un objeto que contiene dos propiedades: */
const pool = new Pool({
  connectionString: process.env.NODE_ENV === "production" ? process.env.DB_URL : process.env.LOCAL_DB_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

/**
 *La función `getClient` se conecta asincrónicamente a un grupo de bases de datos y devuelve el cliente.
 *@returns La función `getClient` devuelve un objeto de cliente que se obtiene al conectarse a un
 *pool.
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

/*`export default pool;` está exportando el objeto `pool` como exportación predeterminada de este módulo. 
Esto significa que cuando otro módulo importe este módulo usando `import pool desde './module'`, lo hará
recibir el objeto `pool` como exportación predeterminada. Esto permite que otros módulos accedan y utilicen el
Objeto `pool` de este módulo. */
export default pool;