import { createStore } from 'vuex'
import type { LegacyAthlete, LegacyAuth } from '../api/types'

// Storage keys
const TOKEN_KEY = 'cycletourmap_token'
const USER_KEY = 'cycletourmap_user'
const ATHLETE_KEY = 'cycletourmap_athlete'

// Helper to safely parse JSON from localStorage
function safeJsonParse<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

export interface User {
  id: string
  email: string
}

export interface StoreState {
  // Auth state
  token: string | null
  user: User | null
  athlete: LegacyAthlete | null
  signedIn: boolean
  hasStravaAuth: boolean

  // Legacy state for compatibility
  activities: unknown[]
  start: string | null
  end: string | null
}

export default createStore<StoreState>({
  state: {
    // Initialize from localStorage if available
    token: localStorage.getItem(TOKEN_KEY),
    user: safeJsonParse<User>(USER_KEY),
    athlete: safeJsonParse<LegacyAthlete>(ATHLETE_KEY),
    signedIn: !!localStorage.getItem(TOKEN_KEY),
    hasStravaAuth: false,

    // Legacy state
    activities: [],
    start: null,
    end: null,
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    currentAthlete: (state) => state.athlete,
    stravaAuth: (state) => state.athlete?.auth,
  },

  mutations: {
    setToken(state, token: string | null) {
      state.token = token
      state.signedIn = !!token
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    },

    setUser(state, user: User | null) {
      state.user = user
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(USER_KEY)
      }
    },

    setAthlete(state, athlete: LegacyAthlete | null) {
      state.athlete = athlete
      if (athlete) {
        localStorage.setItem(ATHLETE_KEY, JSON.stringify(athlete))
      } else {
        localStorage.removeItem(ATHLETE_KEY)
      }
    },

    setStravaAuth(state, auth: LegacyAuth | null) {
      if (state.athlete) {
        state.athlete = { ...state.athlete, auth: auth || undefined }
        localStorage.setItem(ATHLETE_KEY, JSON.stringify(state.athlete))
      }
      state.hasStravaAuth = !!auth
    },

    setHasStravaAuth(state, hasAuth: boolean) {
      state.hasStravaAuth = hasAuth
    },

    setSignedIn(state, signedIn: boolean) {
      state.signedIn = signedIn
    },

    logout(state) {
      state.token = null
      state.user = null
      state.athlete = null
      state.signedIn = false
      state.hasStravaAuth = false
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(ATHLETE_KEY)
    },

    // Legacy mutations for compatibility
    setActivities(state, activities: unknown[]) {
      state.activities = activities
    },

    setStart(state, start: string | null) {
      state.start = start
    },

    setEnd(state, end: string | null) {
      state.end = end
    },
  },

  actions: {
    async initAuth({ commit, state }) {
      // Check if we have a stored token and verify it
      if (state.token) {
        try {
          const { authApi } = await import('../api/client')
          const meResponse = await authApi.me(state.token)
          commit('setUser', meResponse.user)
          commit('setHasStravaAuth', meResponse.stravaConnected)
          if (meResponse.athlete) {
            // Merge with existing athlete data
            const currentAthlete = state.athlete || {}
            commit('setAthlete', {
              ...currentAthlete,
              id: meResponse.athlete.id,
              firstname: meResponse.athlete.firstname,
              lastname: meResponse.athlete.lastname,
              profile: meResponse.athlete.profile,
            })
          }
        } catch (error) {
          // Token is invalid, clear auth state
          console.warn('Token validation failed:', error)
          commit('logout')
        }
      }
    },

    async login({ commit }, { token, user, athlete }: { token: string, user: User, athlete?: LegacyAthlete }) {
      commit('setToken', token)
      commit('setUser', user)
      if (athlete) {
        commit('setAthlete', athlete)
      }
      commit('setHasStravaAuth', true)
    },

    async refreshStravaToken({ state, commit }) {
      if (!state.token) {
        throw new Error('Not authenticated')
      }

      try {
        const { authApi } = await import('../api/client')
        const response = await authApi.refresh(state.token)

        // Update the stored auth with new tokens
        if (state.athlete?.auth) {
          const newAuth: LegacyAuth = {
            ...state.athlete.auth,
            access_token: response.accessToken,
            expires_at: Math.floor(new Date(response.expiresAt).getTime() / 1000),
            token_type: response.tokenType,
          }
          commit('setStravaAuth', newAuth)
        }

        return response
      } catch (error) {
        console.error('Failed to refresh Strava token:', error)
        throw error
      }
    },
  },

  modules: {
  }
})
