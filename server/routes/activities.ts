import { Router, Response } from 'express'
import { db } from '../../db'
import { activities, tourActivities } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { AuthenticatedRequest, requireAuth, optionalAuth } from '../middleware/auth'

const router = Router()

interface ActivityInput {
  activityType: string
  stravaId?: number
  achievementCount?: number
  athleteCount?: number
  averageHeartrate?: number
  averageSpeed?: number
  averageTemp?: number
  averageWatts?: number
  commentCount?: number
  commute?: boolean
  description?: string
  deviceWatts?: number
  displayHideHeartrateOption?: boolean
  distance?: number
  elapsedTime?: number
  elevHigh?: number
  elevLow?: number
  endLatlng?: string
  flagged?: boolean
  gearId?: number
  hasHeartrate?: boolean
  hasKudoed?: boolean
  heartrateOptOut?: boolean
  kilojoules?: number
  kudosCount?: number
  locationCity?: string
  locationCountry?: string
  locationState?: string
  manual?: boolean
  summaryPolyline?: string
  maxHeartrate?: number
  maxSpeed?: number
  movingTime?: number
  name?: string
  photoCount?: number
  prCount?: number
  private?: boolean
  resourceState?: string
  startDate?: string
  startDateLocal?: string
  startLatitude?: number
  startLongitude?: number
  startLatlng?: string
  timezone?: string
  totalElevationGain?: number
  totalPhotoCount?: number
  trainer?: boolean
  type?: string
  uploadId?: number
  utcOffset?: string
  visibility?: boolean
  workoutType?: string
}

/**
 * GET /api/activities - List activities for a tour or user
 * Query params:
 *   - tourId: filter by tour
 *   - limit: max results (default 100)
 *   - offset: pagination offset
 */
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tourId, limit = '100', offset = '0' } = req.query
    const userId = req.user?.userId

    if (tourId && typeof tourId === 'string') {
      // Get activities for a specific tour via junction table
      const result = await db.query.tourActivities.findMany({
        where: eq(tourActivities.tourId, tourId),
        with: {
          activity: true,
        },
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      })

      const activitiesList = result.map(ta => ta.activity)
      res.json(activitiesList)
      return
    }

    // No tourId - return user's activities if authenticated
    if (!userId) {
      res.status(401).json({ error: 'Authentication required to list activities without tourId' })
      return
    }

    const result = await db.query.activities.findMany({
      where: eq(activities.userId, userId),
      orderBy: (activities, { desc }) => [desc(activities.startDate)],
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    })

    res.json(result)
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

/**
 * GET /api/activities/:id - Get single activity
 */
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.user?.userId

    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, id),
    })

    if (!activity) {
      res.status(404).json({ error: 'Activity not found' })
      return
    }

    // Check access: must own the activity OR it must be part of a public tour
    if (activity.userId !== userId) {
      // Check if it's part of any public tour
      const publicTourActivity = await db.query.tourActivities.findFirst({
        where: eq(tourActivities.activityId, id),
        with: {
          tour: true,
        },
      })

      if (!publicTourActivity || !publicTourActivity.tour.isPublic) {
        res.status(403).json({ error: 'Access denied' })
        return
      }
    }

    res.json(activity)
  } catch (error) {
    console.error('Error fetching activity:', error)
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

/**
 * POST /api/activities - Create a single activity
 */
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const activityData = req.body as ActivityInput

    if (!activityData.activityType) {
      res.status(400).json({ error: 'activityType is required' })
      return
    }

    const [newActivity] = await db.insert(activities).values({
      activityType: activityData.activityType,
      userId,
      stravaId: activityData.stravaId,
      achievementCount: activityData.achievementCount,
      athleteCount: activityData.athleteCount,
      averageHeartrate: activityData.averageHeartrate,
      averageSpeed: activityData.averageSpeed,
      averageTemp: activityData.averageTemp,
      averageWatts: activityData.averageWatts,
      commentCount: activityData.commentCount,
      commute: activityData.commute,
      description: activityData.description,
      deviceWatts: activityData.deviceWatts,
      displayHideHeartrateOption: activityData.displayHideHeartrateOption,
      distance: activityData.distance,
      elapsedTime: activityData.elapsedTime,
      elevHigh: activityData.elevHigh,
      elevLow: activityData.elevLow,
      endLatlng: activityData.endLatlng,
      flagged: activityData.flagged,
      gearId: activityData.gearId,
      hasHeartrate: activityData.hasHeartrate,
      hasKudoed: activityData.hasKudoed,
      heartrateOptOut: activityData.heartrateOptOut,
      kilojoules: activityData.kilojoules,
      kudosCount: activityData.kudosCount,
      locationCity: activityData.locationCity,
      locationCountry: activityData.locationCountry,
      locationState: activityData.locationState,
      manual: activityData.manual,
      summaryPolyline: activityData.summaryPolyline,
      maxHeartrate: activityData.maxHeartrate,
      maxSpeed: activityData.maxSpeed,
      movingTime: activityData.movingTime,
      name: activityData.name,
      photoCount: activityData.photoCount,
      prCount: activityData.prCount,
      private: activityData.private,
      resourceState: activityData.resourceState,
      startDate: activityData.startDate ? new Date(activityData.startDate) : null,
      startDateLocal: activityData.startDateLocal ? new Date(activityData.startDateLocal) : null,
      startLatitude: activityData.startLatitude,
      startLongitude: activityData.startLongitude,
      startLatlng: activityData.startLatlng,
      timezone: activityData.timezone,
      totalElevationGain: activityData.totalElevationGain,
      totalPhotoCount: activityData.totalPhotoCount,
      trainer: activityData.trainer,
      type: activityData.type,
      uploadId: activityData.uploadId,
      utcOffset: activityData.utcOffset,
      visibility: activityData.visibility,
      workoutType: activityData.workoutType,
    }).returning()

    res.status(201).json(newActivity)
  } catch (error) {
    console.error('Error creating activity:', error)
    res.status(500).json({ error: 'Failed to create activity' })
  }
})

/**
 * POST /api/activities/batch - Create multiple activities
 */
router.post('/batch', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { activities: activitiesData } = req.body as { activities: ActivityInput[] }

    if (!Array.isArray(activitiesData) || activitiesData.length === 0) {
      res.status(400).json({ error: 'activities array is required and must not be empty' })
      return
    }

    const activitiesToInsert = activitiesData.map((a) => ({
      activityType: a.activityType,
      userId,
      stravaId: a.stravaId,
      achievementCount: a.achievementCount,
      athleteCount: a.athleteCount,
      averageHeartrate: a.averageHeartrate,
      averageSpeed: a.averageSpeed,
      averageTemp: a.averageTemp,
      averageWatts: a.averageWatts,
      commentCount: a.commentCount,
      commute: a.commute,
      description: a.description,
      deviceWatts: a.deviceWatts,
      displayHideHeartrateOption: a.displayHideHeartrateOption,
      distance: a.distance,
      elapsedTime: a.elapsedTime,
      elevHigh: a.elevHigh,
      elevLow: a.elevLow,
      endLatlng: a.endLatlng,
      flagged: a.flagged,
      gearId: a.gearId,
      hasHeartrate: a.hasHeartrate,
      hasKudoed: a.hasKudoed,
      heartrateOptOut: a.heartrateOptOut,
      kilojoules: a.kilojoules,
      kudosCount: a.kudosCount,
      locationCity: a.locationCity,
      locationCountry: a.locationCountry,
      locationState: a.locationState,
      manual: a.manual,
      summaryPolyline: a.summaryPolyline,
      maxHeartrate: a.maxHeartrate,
      maxSpeed: a.maxSpeed,
      movingTime: a.movingTime,
      name: a.name,
      photoCount: a.photoCount,
      prCount: a.prCount,
      private: a.private,
      resourceState: a.resourceState,
      startDate: a.startDate ? new Date(a.startDate) : null,
      startDateLocal: a.startDateLocal ? new Date(a.startDateLocal) : null,
      startLatitude: a.startLatitude,
      startLongitude: a.startLongitude,
      startLatlng: a.startLatlng,
      timezone: a.timezone,
      totalElevationGain: a.totalElevationGain,
      totalPhotoCount: a.totalPhotoCount,
      trainer: a.trainer,
      type: a.type,
      uploadId: a.uploadId,
      utcOffset: a.utcOffset,
      visibility: a.visibility,
      workoutType: a.workoutType,
    }))

    const newActivities = await db.insert(activities)
      .values(activitiesToInsert)
      .returning()

    res.status(201).json(newActivities)
  } catch (error) {
    console.error('Error creating activities batch:', error)
    res.status(500).json({ error: 'Failed to create activities' })
  }
})

/**
 * PUT /api/activities/:id - Update an activity (owner only)
 */
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.userId
    const updateData = req.body as Partial<ActivityInput>

    // Check ownership
    const existing = await db.query.activities.findFirst({
      where: eq(activities.id, id),
    })

    if (!existing) {
      res.status(404).json({ error: 'Activity not found' })
      return
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to update this activity' })
      return
    }

    const [updated] = await db.update(activities)
      .set({
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        startDateLocal: updateData.startDateLocal ? new Date(updateData.startDateLocal) : undefined,
        modifiedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning()

    res.json(updated)
  } catch (error) {
    console.error('Error updating activity:', error)
    res.status(500).json({ error: 'Failed to update activity' })
  }
})

/**
 * DELETE /api/activities/:id - Delete an activity (owner only)
 */
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.userId

    // Check ownership
    const existing = await db.query.activities.findFirst({
      where: eq(activities.id, id),
    })

    if (!existing) {
      res.status(404).json({ error: 'Activity not found' })
      return
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this activity' })
      return
    }

    // Remove from any tours first
    await db.delete(tourActivities).where(eq(tourActivities.activityId, id))

    // Delete the activity
    await db.delete(activities).where(eq(activities.id, id))

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting activity:', error)
    res.status(500).json({ error: 'Failed to delete activity' })
  }
})

export default router
