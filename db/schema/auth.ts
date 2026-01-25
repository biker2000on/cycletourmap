import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const auths = pgTable('Auth', {
  id: uuid('id').primaryKey().defaultRandom(),
  accessToken: text('access_token').notNull(),
  expiresAt: timestamp('expires_at', { precision: 3 }).notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenType: text('token_type').notNull(),
  stravaScope: text('strava_scope').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  modifiedAt: timestamp('modified_at').defaultNow(),
}, (table) => [
  uniqueIndex('Auth_user_id_key').on(table.userId),
])
