import { Router, Response } from 'express'
import { db } from '../../db'
import { athletes } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { AuthenticatedRequest, requireAuth } from '../middleware/auth'

const router = Router()

/**
 * GET /api/athletes/me - Get current user's athlete profile
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    const athlete = await db.query.athletes.findFirst({
      where: eq(athletes.userId, userId),
    })

    if (!athlete) {
      res.status(404).json({ error: 'Athlete profile not found' })
      return
    }

    res.json(athlete)
  } catch (error) {
    console.error('Error fetching athlete profile:', error)
    res.status(500).json({ error: 'Failed to fetch athlete profile' })
  }
})

/**
 * PUT /api/athletes/me - Update or create athlete profile
 */
router.put('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const profileData = req.body

    // Remove fields that shouldn't be set via API
    delete profileData.id
    delete profileData.userId
    delete profileData.createdAt

    // Check if profile exists
    const existing = await db.query.athletes.findFirst({
      where: eq(athletes.userId, userId),
    })

    if (existing) {
      // Update existing profile
      const [updated] = await db.update(athletes)
        .set({
          ...profileData,
          modifiedAt: new Date(),
        })
        .where(eq(athletes.userId, userId))
        .returning()

      res.json(updated)
    } else {
      // Create new profile
      const [created] = await db.insert(athletes)
        .values({
          ...profileData,
          userId,
        })
        .returning()

      res.status(201).json(created)
    }
  } catch (error) {
    console.error('Error updating athlete profile:', error)
    res.status(500).json({ error: 'Failed to update athlete profile' })
  }
})

/**
 * GET /api/athletes/:id - Get athlete profile by ID (public data only)
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string

    const athlete = await db.query.athletes.findFirst({
      where: eq(athletes.id, id),
      columns: {
        id: true,
        firstname: true,
        lastname: true,
        profile: true,
        profileMedium: true,
        city: true,
        state: true,
        country: true,
      },
    })

    if (!athlete) {
      res.status(404).json({ error: 'Athlete not found' })
      return
    }

    res.json(athlete)
  } catch (error) {
    console.error('Error fetching athlete:', error)
    res.status(500).json({ error: 'Failed to fetch athlete' })
  }
})

export default router
