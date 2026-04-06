import * as fs from 'fs';
import * as path from 'path';
import pool from '../../src/config/database.config';

async function verifyTablesExistence() {
    const { rows } = await pool.query(`
            SELECT COUNT(*) AS count FROM pg_stat_user_tables 
        `);
    if (parseInt(rows[0].count) > 0) {
        console.log('La Base de Datos ya cuenta con tablas creadas.');
        console.log('Para configurar la Base de Datos introducir el comando npm run reset-db.');
        await pool.end();
        process.exit(0);
    }
}

export async function setupDatabase(): Promise<void> {
    try {
        await verifyTablesExistence();

        const setupSQL: string = fs.readFileSync(path.join(__dirname, '../schema.psql'), 'utf-8');
        await pool.query(setupSQL);
        console.log('La Base de Datos se ha configurado correctamente (tablas creadas).');
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error(`Error al Configurar la Base de Datos: ${err}`);
        await pool.end();
        process.exit(1);
    }
}

setupDatabase();