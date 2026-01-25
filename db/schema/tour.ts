import { pgTable, uuid, varchar, text, timestamp, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'
import { activities } from './activity'

export const tours = pgTable('Tour', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date', { precision: 3 }).notNull(),
  endDate: timestamp('end_date', { precision: 3 }),
  isPublic: boolean('is_public').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  modifiedAt: timestamp('modified_at').defaultNow(),
}, (table) => [
  index('Tour_user_id_fk').on(table.userId),
])

// Junction table for Tour <-> Activity many-to-many relationship
export const tourActivities = pgTable('TourActivities', {
  tourId: uuid('tour_id').notNull().references(() => tours.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
}, (table) => [
  uniqueIndex('TourActivities_tour_id_activity_id_key').on(table.tourId, table.activityId),
])
