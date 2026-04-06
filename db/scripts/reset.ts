import * as readline from "readline";
import * as dotenv from "dotenv";
import pool from "../../src/config/database";

dotenv.config();

async function askTableDeletionConfirmation(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function verifyTablesExistence() {
  const { rows } = await pool.query(`
            SELECT COUNT(*) AS count FROM pg_stat_user_tables
    `);
  if (parseInt(rows[0].count) === 0) {
    console.log("La Base de Datos no tiene tablas creadas, no es posible resetearla.");
    console.log("Para configurar la Base de Datos introducir el comando npm run setup-db.");
    await pool.end();
    process.exit(0);
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    if (process.env.NODE_ENV === "production") {
      console.log("Reseteo de la Base de Datos en ambiente de produccion no permitido.");
      await pool.end();
      process.exit(0);
    }

    //const res = await pool.query('SELECT current_user');
    //console.log('USUARIO ACTUAL:', res.rows[0].current_user);

    const question: string = "Confirmar eliminacion completa de datos y tablas de la Base de Datos (Y/N): ";
    const answer = await askTableDeletionConfirmation(question);

    if (answer.toLocaleLowerCase() === "y") {
      console.log("Reseteo de la Base de Datos confirmado.");

      await verifyTablesExistence();

      console.log("Eliminando tablas de la Base de Datos...");
      await pool.query(`
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                `);
      console.log("Tablas eliminadas correctamente.");
      await pool.end();
      process.exit(0);
    } else if (answer.toLocaleLowerCase() === "n") {
      console.log("Reseteo de la Base de Datos cancelado.");
      await pool.end();
      process.exit(0);
    } else {
      console.log("Ingresar una respuesta valida (Y/N).");
      await pool.end();
      process.exit(0);
    }
  } catch (err) {
    console.error(`Error al resetear la Base de Datos: ${err}`);
    await pool.end();
    process.exit(1);
  }
}

resetDatabase();