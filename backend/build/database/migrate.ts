import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, sqlite } from '.'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function runMigrations() {
  try {
    await migrate(db, {
      migrationsFolder: 'drizzle/migrations',
    })
    console.log('Migrations completed')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    sqlite.close()
  }
}

runMigrations()
