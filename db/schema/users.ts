import { pgTable, pgSchema, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Define the basic_auth schema
export const basicAuthSchema = pgSchema('basic_auth')

// Users table in basic_auth schema
export const users = basicAuthSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  modifiedAt: timestamp('modified_at').defaultNow(),
})

// We'll define relations after importing other tables to avoid circular deps
// Relations are exported from index.ts
