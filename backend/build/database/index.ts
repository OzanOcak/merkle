import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'path'

const dbPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../../db.sqlite') // Production path
    : path.join(__dirname, '../../../db.sqlite') // Development path

const sqlite = new Database(dbPath)
const db = drizzle(sqlite, { schema })

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function connectDatabase() {
  try {
    console.log(`Using database at: ${dbPath}`)

    // Apply migrations
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../drizzle')
    })

    // Test connection
    await db.select().from(schema.files).limit(1).execute()
    return db
  } catch (err) {
    console.error('Database initialization failed:', err)
    throw err
  }
}

export { db, sqlite }
