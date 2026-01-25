import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://cyclist:cyclist@localhost:5432/cycletourmap'
})

export const db = drizzle(pool, { schema })
export type Database = typeof db

// Re-export schema for convenience
export * from './schema'
