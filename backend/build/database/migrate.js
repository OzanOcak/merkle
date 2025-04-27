"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrator_1 = require("drizzle-orm/better-sqlite3/migrator");
const _1 = require(".");
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function runMigrations() {
    try {
        await (0, migrator_1.migrate)(_1.db, {
            migrationsFolder: 'drizzle/migrations',
        });
        console.log('Migrations completed');
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
    finally {
        _1.sqlite.close();
    }
}
runMigrations();
