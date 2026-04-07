import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import pool from "../../src/config/database.config";

dotenv.config();

async function extractExecutedFiles() {
  const { rows } = await pool.query(`
        SELECT file_name FROM migrations_history
    `);
  const executedFiles: string[] = [];
  for (const row of rows) {
    executedFiles.push(row.file_name);
  }
  return executedFiles;
}

async function executeMigrations(executedFiles: string[]) {
  const migrationsFiles: string[] = fs.readdirSync(path.join(__dirname, "../migrations")).sort();
  if (migrationsFiles.length === 0) {
    console.log("No hay migraciones disponibles, la Base de Datos esta actualizada.");
    return;
  }
  for (const migrationFile of migrationsFiles) {
    if (executedFiles.includes(migrationFile)) {
      console.log(`Migracion ya ejecutada: ${migrationFile}`);
      continue;
    }
    try {
      const currentMigrationSQL: string = fs.readFileSync(path.join(__dirname, `../migrations/${migrationFile}`), "utf-8");
      await pool.query(currentMigrationSQL);
      await pool.query(`
                   INSERT INTO "migrations_history" ("file_name", "created_by") VALUES ($1, $2)`,
      [migrationFile, process.env.DB_USER]
      );
      console.log("Migracion Ejecutada Existosamente.");
      console.log(`Base de Datos actualizada con la migracion: ${migrationFile}`);
    } catch (err) {
      console.error(`Error al Ejecutar Migracion: ${err}`);
      console.log(`No se pudo actualizar la Base de Datos con la migracion: ${migrationFile}`);
    }
  }
}

async function verifyTablesExistence() {
  const { rows: countRows } = await pool.query(`
            SELECT COUNT(*) AS count FROM pg_stat_user_tables
    `);
  if (parseInt(countRows[0].count) === 0) {
    console.log("La Base de Datos no tiene tablas creadas.");
    console.log("Para configurar la Base de Datos introducir el comando npm run setup-db.");
    await pool.end();
    process.exit(0);
  }
}

export async function migrateDatabase(): Promise<void> {
  try {
    await verifyTablesExistence();

    await pool.query(`
            CREATE TABLE IF NOT EXISTS "migrations_history" (
                "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
                "file_name" varchar(300) UNIQUE NOT NULL,
                "created_by" varchar(200) NOT NULL,
                "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()

            )
        `);
    const executedFiles: string[] = await extractExecutedFiles();
    await executeMigrations(executedFiles);
    console.log("Proceso de migracion completado.");
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error(`Error al migrar la Base de Datos: ${err}`);
    await pool.end();
    process.exit(1);
  }
}

migrateDatabase();