import { Router, Response } from 'express'
import { db } from '../../db'
import { activities, tourActivities, auths } from '../../db/schema'
import { eq, and, gte, lte, notInArray } from 'drizzle-orm'
import { AuthenticatedRequest, requireAuth, optionalAuth } from '../middleware/auth'

// Background sync jobs in progress (keyed by uniqueId)
const activeSyncJobs = new Map<string, { status: string; progress: number; total: number; error?: string }>()

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
 * GET /api/activities/by-date-range - Get user's existing activities in a date range
 * Query params:
 *   - startDate: ISO date string (required)
 *   - endDate: ISO date string (required)
 */
router.get('/by-date-range', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' })
      return
    }

    const start = new Date(startDate as string)
    const end = new Date(endDate as string)

    // Query activities in date range, handling nullable startDateLocal
    const result = await db.query.activities.findMany({
      where: eq(activities.userId, userId),
      orderBy: (activities, { asc }) => [asc(activities.startDateLocal)],
    })

    // Filter by date range in JavaScript to handle nulls safely
    const filtered = result.filter(activity => {
      if (!activity.startDateLocal) return false
      const actDate = new Date(activity.startDateLocal)
      return actDate >= start && actDate <= end
    })

    res.json(filtered)
  } catch (error) {
    console.error('Error fetching activities by date range:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

/**
 * POST /api/activities/sync - Start background sync from Strava for a date range
 * Body: { startDate, endDate, tourId?, existingStravaIds? }
 */
router.post('/sync', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { startDate, endDate, tourId, existingStravaIds = [] } = req.body

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' })
      return
    }

    // Get user's Strava access token
    const auth = await db.query.auths.findFirst({
      where: eq(auths.userId, userId),
    })

    if (!auth || !auth.accessToken) {
      res.status(400).json({ error: 'No Strava connection found' })
      return
    }

    // Check if token needs refresh
    const now = new Date()
    let accessToken = auth.accessToken

    if (auth.expiresAt && auth.expiresAt < now) {
      // Token expired - would need to refresh
      // For now, return error - client should refresh first
      res.status(401).json({ error: 'Strava token expired. Please reconnect.' })
      return
    }

    // Create a unique job ID
    const jobId = `sync-${userId}-${Date.now()}`

    // Initialize job status
    activeSyncJobs.set(jobId, { status: 'started', progress: 0, total: 0 })

    // Start background sync (don't await)
    syncStravaActivities(jobId, userId, accessToken, startDate, endDate, tourId, existingStravaIds)
      .catch(err => {
        console.error('Background sync error:', err)
        const job = activeSyncJobs.get(jobId)
        if (job) {
          job.status = 'error'
          job.error = err.message
        }
      })

    res.json({ jobId, status: 'started' })
  } catch (error) {
    console.error('Error starting sync:', error)
    res.status(500).json({ error: 'Failed to start sync' })
  }
})

/**
 * GET /api/activities/sync/:jobId - Check sync job status
 */
router.get('/sync/:jobId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params
  const job = activeSyncJobs.get(jobId)

  if (!job) {
    res.status(404).json({ error: 'Sync job not found' })
    return
  }

  res.json(job)

  // Clean up completed jobs after reporting
  if (job.status === 'completed' || job.status === 'error') {
    setTimeout(() => activeSyncJobs.delete(jobId), 60000) // Clean up after 1 minute
  }
})

/**
 * Background function to sync activities from Strava
 */
async function syncStravaActivities(
  jobId: string,
  userId: string,
  accessToken: string,
  startDate: string,
  endDate: string,
  tourId?: string,
  existingStravaIds: number[] = []
) {
  const job = activeSyncJobs.get(jobId)!
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startTimestamp = Math.floor(start.getTime() / 1000) - 43200 // -12h for timezone
  const endTimestamp = Math.floor(end.getTime() / 1000)

  let page = 1
  const perPage = 50
  let totalFetched = 0
  let totalSaved = 0

  // Build set of existing stravaIds - combine passed IDs with database query
  const existingSet = new Set(existingStravaIds)

  try {
    // Query database for any existing stravaIds for this user to prevent duplicates
    const existingActivities = await db.query.activities.findMany({
      where: eq(activities.userId, userId),
      columns: { stravaId: true },
    })
    existingActivities.forEach(a => {
      if (a.stravaId) existingSet.add(a.stravaId)
    })

    let hasMore = true
    let tourRangeCovered = false

    while (hasMore) {
      // Fetch from Strava
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}&after=${startTimestamp}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`)
      }

      const stravaActivities = await response.json()
      const rawCount = stravaActivities.length

      // Filter to date range for the tour
      const filtered = stravaActivities.filter((a: any) => {
        const actDate = new Date(a.start_date_local)
        return actDate >= start && actDate <= end
      })

      // Filter out activities we already have
      const newActivities = filtered.filter((a: any) => !existingSet.has(a.id))

      // Also save activities outside tour range for future use (but don't link to tour)
      const outsideRangeActivities = stravaActivities.filter((a: any) => {
        const actDate = new Date(a.start_date_local)
        return actDate < start && !existingSet.has(a.id)
      })

      // Save new activities within tour range to database
      if (newActivities.length > 0) {
        const toInsert = newActivities.map((a: any) => ({
          activityType: 'STRAVA',
          userId,
          stravaId: a.id,
          name: a.name,
          type: a.type,
          distance: a.distance,
          movingTime: a.moving_time,
          elapsedTime: a.elapsed_time,
          totalElevationGain: a.total_elevation_gain,
          startDate: new Date(a.start_date),
          startDateLocal: new Date(a.start_date_local),
          timezone: a.timezone,
          summaryPolyline: a.map?.summary_polyline,
          averageSpeed: a.average_speed,
          maxSpeed: a.max_speed,
          averageHeartrate: a.average_heartrate != null ? Math.round(a.average_heartrate) : null,
          maxHeartrate: a.max_heartrate != null ? Math.round(a.max_heartrate) : null,
          startLatitude: a.start_latlng?.[0],
          startLongitude: a.start_latlng?.[1],
        }))

        try {
          const inserted = await db.insert(activities).values(toInsert).returning()
          totalSaved += inserted.length

          // Link to tour if provided
          if (tourId && inserted.length > 0) {
            const links = inserted.map(act => ({ tourId, activityId: act.id }))
            await db.insert(tourActivities).values(links)
          }

          // Add to existing set to avoid duplicates in subsequent pages
          newActivities.forEach((a: any) => existingSet.add(a.id))
        } catch (insertErr: any) {
          console.error('Error inserting activities batch:', insertErr)
          console.error('Failed data sample:', JSON.stringify(toInsert[0], null, 2))
          throw new Error(`Database insert failed: ${insertErr.message}`)
        }
      }

      totalFetched += filtered.length

      // Update job progress
      job.progress = totalSaved
      job.total = totalFetched

      // Check if we've covered the tour date range
      const oldestInBatch = stravaActivities[stravaActivities.length - 1]
      if (oldestInBatch) {
        const oldestDate = new Date(oldestInBatch.start_date_local)
        if (oldestDate < start && !tourRangeCovered) {
          // Tour range is fully covered - mark as completed for the client
          tourRangeCovered = true
          job.status = 'completed'
          console.log(`Tour sync completed with ${totalSaved} activities. Continuing background sync...`)
        }
      }

      // Check if we should stop fetching entirely
      if (rawCount < perPage) {
        hasMore = false
      } else {
        // Continue fetching older activities in background (for future tours)
        // But only continue for a reasonable amount (e.g., 1 year back from tour start)
        if (oldestInBatch) {
          const oldestDate = new Date(oldestInBatch.start_date_local)
          const oneYearBeforeStart = new Date(start)
          oneYearBeforeStart.setFullYear(oneYearBeforeStart.getFullYear() - 1)

          if (oldestDate < oneYearBeforeStart) {
            hasMore = false // Stop - we've gone far enough back
          }
        }
        page++
      }

      // Save outside-range activities in background (don't link to tour)
      if (outsideRangeActivities.length > 0 && tourRangeCovered) {
        const toInsertBg = outsideRangeActivities.map((a: any) => ({
          activityType: 'STRAVA',
          userId,
          stravaId: a.id,
          name: a.name,
          type: a.type,
          distance: a.distance,
          movingTime: a.moving_time,
          elapsedTime: a.elapsed_time,
          totalElevationGain: a.total_elevation_gain,
          startDate: new Date(a.start_date),
          startDateLocal: new Date(a.start_date_local),
          timezone: a.timezone,
          summaryPolyline: a.map?.summary_polyline,
          averageSpeed: a.average_speed,
          maxSpeed: a.max_speed,
          averageHeartrate: a.average_heartrate != null ? Math.round(a.average_heartrate) : null,
          maxHeartrate: a.max_heartrate != null ? Math.round(a.max_heartrate) : null,
          startLatitude: a.start_latlng?.[0],
          startLongitude: a.start_latlng?.[1],
        }))

        try {
          await db.insert(activities).values(toInsertBg)
          outsideRangeActivities.forEach((a: any) => existingSet.add(a.id))
        } catch (bgErr) {
          console.warn('Background activity insert failed:', bgErr)
          // Don't throw - this is background work
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // If we never hit an activity before the start date, mark as completed now
    if (!tourRangeCovered) {
      job.status = 'completed'
    }
  } catch (error: any) {
    job.status = 'error'
    job.error = error.message
    throw error
  }
}

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
 * POST /api/activities/batch - Create multiple activities and link to a tour
 */
router.post('/batch', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { activities: activitiesData, tourId } = req.body as { activities: ActivityInput[], tourId?: string }

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

    // If tourId provided, link activities to the tour
    if (tourId && newActivities.length > 0) {
      const tourActivityLinks = newActivities.map(activity => ({
        tourId,
        activityId: activity.id,
      }))

      await db.insert(tourActivities).values(tourActivityLinks)
    }

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
