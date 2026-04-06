import * as fs from "fs";
import * as path from "path";
import pool from "../../src/config/database";

async function verifyTablesExistence() {
  const { rows } = await pool.query(`
            SELECT COUNT(*) AS count FROM pg_stat_user_tables
        `);
  if (parseInt(rows[0].count) === 0) {
    console.log("La Base de Datos no tiene tablas creadas.");
    console.log("Para poblar la Base de Datos introducir el comando npm run setup-db.");
    await pool.end();
    process.exit(0);
  }
}

export async function populateDatabase(): Promise<void> {
  try {
    await verifyTablesExistence();

    const populateSQL: string = fs.readFileSync(path.join(__dirname, "../seed.psql"), "utf-8");
    await pool.query(populateSQL);
    console.log("La Base de Datos se ha poblado correctamente.");
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error(`Error al poblar la Base de Datos: ${err}`);
    await pool.end();
    process.exit(1);
  }
}

populateDatabase();