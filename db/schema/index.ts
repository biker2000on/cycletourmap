import { relations } from 'drizzle-orm'

// Export all tables
export { basicAuthSchema, users } from './users'
export { activities } from './activity'
export { athletes } from './athlete'
export { auths } from './auth'
export { tours, tourActivities } from './tour'

// Import tables for relations
import { users } from './users'
import { activities } from './activity'
import { athletes } from './athlete'
import { auths } from './auth'
import { tours, tourActivities } from './tour'

// Define relations

export const usersRelations = relations(users, ({ one, many }) => ({
  athlete: one(athletes),
  auth: one(auths),
  activities: many(activities),
  tours: many(tours),
}))

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  tourActivities: many(tourActivities),
}))

export const athletesRelations = relations(athletes, ({ one }) => ({
  user: one(users, {
    fields: [athletes.userId],
    references: [users.id],
  }),
}))

export const authsRelations = relations(auths, ({ one }) => ({
  user: one(users, {
    fields: [auths.userId],
    references: [users.id],
  }),
}))

export const toursRelations = relations(tours, ({ one, many }) => ({
  user: one(users, {
    fields: [tours.userId],
    references: [users.id],
  }),
  tourActivities: many(tourActivities),
}))

export const tourActivitiesRelations = relations(tourActivities, ({ one }) => ({
  tour: one(tours, {
    fields: [tourActivities.tourId],
    references: [tours.id],
  }),
  activity: one(activities, {
    fields: [tourActivities.activityId],
    references: [activities.id],
  }),
}))
