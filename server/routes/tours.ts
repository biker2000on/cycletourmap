import { Router, Response } from 'express'
import { db } from '../../db'
import { tours, tourActivities } from '../../db/schema'
import { eq, or } from 'drizzle-orm'
import { AuthenticatedRequest, requireAuth, optionalAuth } from '../middleware/auth'

const router = Router()

interface TourInput {
  name: string
  description?: string
  startDate: string
  endDate?: string
  isPublic?: boolean
  activityIds?: string[]
}

/**
 * GET /api/tours - List all public tours or user's own tours
 */
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    let whereClause
    if (userId) {
      // Authenticated: show public tours OR user's own tours
      whereClause = or(
        eq(tours.isPublic, true),
        eq(tours.userId, userId)
      )
    } else {
      // Not authenticated: only public tours
      whereClause = eq(tours.isPublic, true)
    }

    const result = await db.query.tours.findMany({
      where: whereClause,
      orderBy: (tours, { desc }) => [desc(tours.startDate)],
      with: {
        user: {
          columns: {
            id: true,
            email: true,
          },
        },
      },
    })

    res.json(result)
  } catch (error) {
    console.error('Error fetching tours:', error)
    res.status(500).json({ error: 'Failed to fetch tours' })
  }
})

/**
 * GET /api/tours/:id - Get single tour with activities
 */
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.user?.userId

    const tour = await db.query.tours.findFirst({
      where: eq(tours.id, id),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
          },
        },
        tourActivities: {
          with: {
            activity: true,
          },
        },
      },
    })

    if (!tour) {
      res.status(404).json({ error: 'Tour not found' })
      return
    }

    // Check access: must be public OR owned by user
    if (!tour.isPublic && tour.userId !== userId) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    // Transform tourActivities to activities array for cleaner response
    const activitiesArray = tour.tourActivities.map(ta => ta.activity)
    console.log(`Tour ${id}: found ${activitiesArray.length} activities via tourActivities`)
    if (activitiesArray.length > 0) {
      console.log('First activity:', JSON.stringify(activitiesArray[0], null, 2).substring(0, 500))
    }

    const tourWithActivities = {
      ...tour,
      activities: activitiesArray,
      tourActivities: undefined,
    }

    res.json(tourWithActivities)
  } catch (error) {
    console.error('Error fetching tour:', error)
    res.status(500).json({ error: 'Failed to fetch tour' })
  }
})

/**
 * POST /api/tours - Create a new tour
 */
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, startDate, endDate, isPublic, activityIds } = req.body as TourInput
    const userId = req.user!.userId

    if (!name || !startDate) {
      res.status(400).json({ error: 'Name and startDate are required' })
      return
    }

    const [newTour] = await db.insert(tours).values({
      name,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isPublic: isPublic ?? false,
      userId,
    }).returning()

    // If activityIds provided, link them to the tour
    if (activityIds && Array.isArray(activityIds) && activityIds.length > 0) {
      await db.insert(tourActivities).values(
        activityIds.map((activityId: string) => ({
          tourId: newTour.id,
          activityId,
        }))
      )
    }

    res.status(201).json(newTour)
  } catch (error) {
    console.error('Error creating tour:', error)
    res.status(500).json({ error: 'Failed to create tour' })
  }
})

/**
 * PUT /api/tours/:id - Update a tour (owner only)
 */
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.userId
    const { name, description, startDate, endDate, isPublic, activityIds } = req.body as Partial<TourInput>

    // Check ownership
    const existing = await db.query.tours.findFirst({
      where: eq(tours.id, id),
    })

    if (!existing) {
      res.status(404).json({ error: 'Tour not found' })
      return
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to update this tour' })
      return
    }

    const updateData: Record<string, unknown> = { modifiedAt: new Date() }
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (isPublic !== undefined) updateData.isPublic = isPublic

    const [updated] = await db.update(tours)
      .set(updateData)
      .where(eq(tours.id, id))
      .returning()

    // If activityIds provided, replace all tour activities
    if (activityIds !== undefined && Array.isArray(activityIds)) {
      // Remove existing
      await db.delete(tourActivities).where(eq(tourActivities.tourId, id))

      // Add new ones
      if (activityIds.length > 0) {
        await db.insert(tourActivities).values(
          activityIds.map((activityId: string) => ({
            tourId: id,
            activityId,
          }))
        )
      }
    }

    res.json(updated)
  } catch (error) {
    console.error('Error updating tour:', error)
    res.status(500).json({ error: 'Failed to update tour' })
  }
})

/**
 * DELETE /api/tours/:id - Delete a tour (owner only)
 */
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.userId

    // Check ownership
    const existing = await db.query.tours.findFirst({
      where: eq(tours.id, id),
    })

    if (!existing) {
      res.status(404).json({ error: 'Tour not found' })
      return
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this tour' })
      return
    }

    // Delete tour activities first (junction table)
    await db.delete(tourActivities).where(eq(tourActivities.tourId, id))

    // Delete the tour
    await db.delete(tours).where(eq(tours.id, id))

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting tour:', error)
    res.status(500).json({ error: 'Failed to delete tour' })
  }
})

export default router
