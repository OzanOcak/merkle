import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { resolve } from 'path'

// Fixed path with proper cleanup handling
const dbPath = resolve(__dirname, '../../db.sqlite')
const sqlite = new Database(dbPath, { verbose: console.log })

// Disable WAL mode if you don't need concurrent writes
sqlite.pragma('journal_mode = DELETE')

const db = drizzle(sqlite, { schema })

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function connectDatabase() {
  try {
    await db.select().from(schema.files).limit(1).execute()
    console.log(`Connected to ${dbPath}`)
    return db
  } catch (err) {
    console.error('Connection error:', err)
    throw err
  }
}

export { db, sqlite }
