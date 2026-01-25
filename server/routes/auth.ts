import { Router, Response, Request } from 'express'
import { db } from '../../db'
import { users, auths, athletes } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { AuthenticatedRequest, requireAuth, generateToken } from '../middleware/auth'

const router = Router()

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET

interface StravaTokenResponse {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
  athlete: {
    id: number
    firstname: string
    lastname: string
    profile: string
    profile_medium: string
    sex: string
    city: string
    state: string
    country: string
    date_preference: string
    measurement_preference: string
    weight: number
  }
}

interface StravaRefreshResponse {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
}

/**
 * POST /api/auth/strava/callback - Handle Strava OAuth callback
 * Expects { code: string } in request body
 */
router.post('/strava/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body

    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' })
      return
    }

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      res.status(500).json({ error: 'Strava OAuth not configured' })
      return
    }

    // Exchange code for token with Strava
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Strava token exchange failed:', error)
      res.status(400).json({ error: 'Failed to exchange authorization code' })
      return
    }

    const tokenData = await tokenResponse.json() as StravaTokenResponse
    const stravaAthlete = tokenData.athlete

    // Find or create user by Strava ID
    let existingAthlete = await db.query.athletes.findFirst({
      where: eq(athletes.stravaId, stravaAthlete.id),
      with: {
        user: true,
      },
    })

    let userId: string

    if (existingAthlete) {
      // User exists, update their auth and athlete info
      userId = existingAthlete.userId

      // Update athlete profile
      await db.update(athletes)
        .set({
          firstname: stravaAthlete.firstname,
          lastname: stravaAthlete.lastname,
          profile: stravaAthlete.profile,
          profileMedium: stravaAthlete.profile_medium,
          sex: stravaAthlete.sex,
          city: stravaAthlete.city,
          state: stravaAthlete.state,
          country: stravaAthlete.country,
          datePreference: stravaAthlete.date_preference,
          measurementPreference: stravaAthlete.measurement_preference,
          weight: stravaAthlete.weight,
          modifiedAt: new Date(),
        })
        .where(eq(athletes.userId, userId))

      // Update or insert auth tokens
      const existingAuth = await db.query.auths.findFirst({
        where: eq(auths.userId, userId),
      })

      if (existingAuth) {
        await db.update(auths)
          .set({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: new Date(tokenData.expires_at * 1000),
            tokenType: tokenData.token_type,
            modifiedAt: new Date(),
          })
          .where(eq(auths.userId, userId))
      } else {
        await db.insert(auths).values({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(tokenData.expires_at * 1000),
          tokenType: tokenData.token_type,
          stravaScope: 'read,activity:read',
          userId,
        })
      }
    } else {
      // Create new user
      const email = `strava_${stravaAthlete.id}@strava.user`

      const [newUser] = await db.insert(users).values({
        email,
        passwordHash: '', // Strava users don't have password
      }).returning()

      userId = newUser.id

      // Create athlete profile
      await db.insert(athletes).values({
        stravaId: stravaAthlete.id,
        firstname: stravaAthlete.firstname,
        lastname: stravaAthlete.lastname,
        profile: stravaAthlete.profile,
        profileMedium: stravaAthlete.profile_medium,
        sex: stravaAthlete.sex,
        city: stravaAthlete.city,
        state: stravaAthlete.state,
        country: stravaAthlete.country,
        datePreference: stravaAthlete.date_preference,
        measurementPreference: stravaAthlete.measurement_preference,
        weight: stravaAthlete.weight,
        userId,
      })

      // Create auth record
      await db.insert(auths).values({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(tokenData.expires_at * 1000),
        tokenType: tokenData.token_type,
        stravaScope: 'read,activity:read',
        userId,
      })
    }

    // Generate JWT for our API
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    const token = generateToken(userId, user!.email)

    res.json({
      token,
      user: {
        id: userId,
        email: user!.email,
      },
      athlete: {
        firstname: stravaAthlete.firstname,
        lastname: stravaAthlete.lastname,
        profile: stravaAthlete.profile,
      },
    })
  } catch (error) {
    console.error('Error in Strava callback:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

/**
 * POST /api/auth/refresh - Refresh Strava tokens
 */
router.post('/refresh', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      res.status(500).json({ error: 'Strava OAuth not configured' })
      return
    }

    // Get current auth record
    const auth = await db.query.auths.findFirst({
      where: eq(auths.userId, userId),
    })

    if (!auth) {
      res.status(404).json({ error: 'No Strava auth found for user' })
      return
    }

    // Check if token is expired
    const now = new Date()
    if (auth.expiresAt > now) {
      // Token still valid
      res.json({
        accessToken: auth.accessToken,
        expiresAt: auth.expiresAt,
        tokenType: auth.tokenType,
      })
      return
    }

    // Refresh the token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: auth.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Strava token refresh failed:', error)
      res.status(400).json({ error: 'Failed to refresh token' })
      return
    }

    const tokenData = await tokenResponse.json() as StravaRefreshResponse

    // Update auth record
    await db.update(auths)
      .set({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(tokenData.expires_at * 1000),
        modifiedAt: new Date(),
      })
      .where(eq(auths.userId, userId))

    res.json({
      accessToken: tokenData.access_token,
      expiresAt: new Date(tokenData.expires_at * 1000),
      tokenType: tokenData.token_type,
    })
  } catch (error) {
    console.error('Error refreshing token:', error)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
})

/**
 * GET /api/auth/me - Get current auth status
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const athlete = await db.query.athletes.findFirst({
      where: eq(athletes.userId, userId),
    })

    const auth = await db.query.auths.findFirst({
      where: eq(auths.userId, userId),
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
      },
      athlete: athlete ? {
        id: athlete.id,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        profile: athlete.profile,
      } : null,
      stravaConnected: !!auth,
      stravaTokenValid: auth ? auth.expiresAt > new Date() : false,
    })
  } catch (error) {
    console.error('Error fetching auth status:', error)
    res.status(500).json({ error: 'Failed to fetch auth status' })
  }
})

export default router
