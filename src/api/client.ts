import type {
  Tour,
  Activity,
  Athlete,
  User,
  CreateTour,
  UpdateTour,
  CreateActivity,
  UpdateActivity,
  UpdateAthlete,
  AuthResponse,
  RefreshResponse,
  MeResponse,
  LegacyTour,
  LegacyActivity,
  LegacyAthlete,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new ApiError(response.status, error.message || error.error || `HTTP ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

// Helper to convert API response to legacy format for backward compatibility
function tourToLegacy(tour: Tour): LegacyTour {
  return {
    id: tour.id,
    name: tour.name,
    description: tour.description,
    start_date: tour.startDate,
    end_date: tour.endDate,
    isPublic: tour.isPublic,
    activities: tour.activities ? {
      items: tour.activities.map(activityToLegacy),
      nextToken: undefined,
    } : undefined,
  }
}

function activityToLegacy(activity: Activity): LegacyActivity {
  return {
    id: activity.id,
    activity_type: activity.activityType,
    strava_id: activity.stravaId,
    summary_polyline: activity.summaryPolyline || activity.summary_polyline,
    elapsed_time: activity.elapsedTime,
    moving_time: activity.movingTime || activity.moving_time,
    name: activity.name,
    start_date: activity.startDate || activity.start_date,
    start_date_local: activity.startDateLocal || activity.start_date_local,
    type: activity.type,
    distance: activity.distance,
    total_elevation_gain: activity.totalElevationGain || activity.total_elevation_gain,
  }
}

// Typed API functions
export const toursApi = {
  list: async (token?: string): Promise<Tour[]> => {
    return api<Tour[]>('/tours', { token })
  },

  listLegacy: async (token?: string): Promise<{ items: LegacyTour[] }> => {
    const tours = await api<Tour[]>('/tours', { token })
    return { items: tours.map(tourToLegacy) }
  },

  get: async (id: string, token?: string): Promise<Tour> => {
    return api<Tour>(`/tours/${id}`, { token })
  },

  getLegacy: async (id: string, token?: string): Promise<{ getTour: LegacyTour }> => {
    const tour = await api<Tour>(`/tours/${id}`, { token })
    return { getTour: tourToLegacy(tour) }
  },

  create: async (data: CreateTour, token: string): Promise<Tour> => {
    return api<Tour>('/tours', { method: 'POST', body: data, token })
  },

  update: async (id: string, data: UpdateTour, token: string): Promise<Tour> => {
    return api<Tour>(`/tours/${id}`, { method: 'PUT', body: data, token })
  },

  delete: async (id: string, token: string): Promise<void> => {
    return api<void>(`/tours/${id}`, { method: 'DELETE', token })
  },
}

export const activitiesApi = {
  list: async (tourId: string, token?: string): Promise<Activity[]> => {
    return api<Activity[]>(`/activities?tourId=${tourId}`, { token })
  },

  listLegacy: async (tourId: string, token?: string): Promise<LegacyActivity[]> => {
    const activities = await api<Activity[]>(`/activities?tourId=${tourId}`, { token })
    return activities.map(activityToLegacy)
  },

  get: async (id: string, token?: string): Promise<Activity> => {
    return api<Activity>(`/activities/${id}`, { token })
  },

  create: async (data: CreateActivity, token: string): Promise<Activity> => {
    return api<Activity>('/activities', { method: 'POST', body: data, token })
  },

  createBatch: async (data: CreateActivity[], token: string, tourId?: string): Promise<Activity[]> => {
    return api<Activity[]>('/activities/batch', { method: 'POST', body: { activities: data, tourId }, token })
  },

  getByDateRange: async (startDate: string, endDate: string, token: string): Promise<Activity[]> => {
    return api<Activity[]>(`/activities/by-date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, { token })
  },

  startSync: async (startDate: string, endDate: string, token: string, tourId?: string, existingStravaIds?: number[]): Promise<{ jobId: string; status: string }> => {
    return api<{ jobId: string; status: string }>('/activities/sync', {
      method: 'POST',
      body: { startDate, endDate, tourId, existingStravaIds },
      token
    })
  },

  getSyncStatus: async (jobId: string, token: string): Promise<{ status: string; progress: number; total: number; error?: string }> => {
    return api<{ status: string; progress: number; total: number; error?: string }>(`/activities/sync/${jobId}`, { token })
  },

  update: async (id: string, data: UpdateActivity, token: string): Promise<Activity> => {
    return api<Activity>(`/activities/${id}`, { method: 'PUT', body: data, token })
  },

  delete: async (id: string, token: string): Promise<void> => {
    return api<void>(`/activities/${id}`, { method: 'DELETE', token })
  },
}

export const authApi = {
  stravaCallback: async (code: string): Promise<AuthResponse> => {
    return api<AuthResponse>('/auth/strava/callback', { method: 'POST', body: { code } })
  },

  refresh: async (token: string): Promise<RefreshResponse> => {
    return api<RefreshResponse>('/auth/refresh', { method: 'POST', token })
  },

  me: async (token: string): Promise<MeResponse> => {
    return api<MeResponse>('/auth/me', { token })
  },
}

export const athletesApi = {
  me: async (token: string): Promise<Athlete> => {
    return api<Athlete>('/athletes/me', { token })
  },

  update: async (data: UpdateAthlete, token: string): Promise<Athlete> => {
    return api<Athlete>('/athletes/me', { method: 'PUT', body: data, token })
  },

  get: async (id: string): Promise<Partial<Athlete>> => {
    return api<Partial<Athlete>>(`/athletes/${id}`)
  },
}
