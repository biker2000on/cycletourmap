import { pgTable, uuid, text, integer, doublePrecision, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const athletes = pgTable('Athlete', {
  id: uuid('id').primaryKey().defaultRandom(),
  stravaId: integer('strava_id'),
  firstname: text('firstname'),
  lastname: text('lastname'),
  profile: text('profile'),
  profileMedium: text('profile_medium'),
  sex: text('sex'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  datePreference: text('date_preference'),
  measurementPreference: text('measurement_preference'),
  weight: doublePrecision('weight'),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  modifiedAt: timestamp('modified_at').defaultNow(),
}, (table) => [
  uniqueIndex('Athlete_user_id_key').on(table.userId),
])
