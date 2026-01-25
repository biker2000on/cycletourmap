// API Response Types

export interface User {
  id: string
  email: string
}

export interface Athlete {
  id: string
  stravaId?: number
  firstname?: string
  lastname?: string
  profile?: string
  profileMedium?: string
  sex?: string
  city?: string
  state?: string
  country?: string
  datePreference?: string
  measurementPreference?: string
  weight?: number
  userId: string
  createdAt?: string
  modifiedAt?: string
}

export interface Auth {
  id: string
  accessToken: string
  refreshToken: string
  expiresAt: string
  tokenType: string
  stravaScope?: string
  userId: string
}

export interface Tour {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  isPublic: boolean
  userId: string
  user?: Pick<User, 'id' | 'email'>
  activities?: Activity[]
  createdAt?: string
  modifiedAt?: string
}

export interface Activity {
  id: string
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
  summary_polyline?: string // Legacy field name for compatibility
  maxHeartrate?: number
  maxSpeed?: number
  movingTime?: number
  moving_time?: number // Legacy field name
  name?: string
  photoCount?: number
  prCount?: number
  private?: boolean
  resourceState?: string
  startDate?: string
  start_date?: string // Legacy field name
  startDateLocal?: string
  start_date_local?: string // Legacy field name
  startLatitude?: number
  startLongitude?: number
  startLatlng?: string
  timezone?: string
  totalElevationGain?: number
  total_elevation_gain?: number // Legacy field name
  totalPhotoCount?: number
  trainer?: boolean
  type?: string
  uploadId?: number
  utcOffset?: string
  visibility?: boolean
  workoutType?: string
  userId: string
  createdAt?: string
  modifiedAt?: string
}

// API Input Types

export interface CreateTour {
  name: string
  description?: string
  startDate: string
  endDate?: string
  isPublic?: boolean
  activityIds?: string[]
}

export interface UpdateTour {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  isPublic?: boolean
  activityIds?: string[]
}

export interface CreateActivity {
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
  tourId?: string  // If provided, link to tour on creation
}

export interface UpdateActivity extends Partial<CreateActivity> {}

export interface UpdateAthlete {
  firstname?: string
  lastname?: string
  profile?: string
  profileMedium?: string
  sex?: string
  city?: string
  state?: string
  country?: string
  datePreference?: string
  measurementPreference?: string
  weight?: number
}

// Auth Response Types

export interface AuthResponse {
  token: string
  user: User
  athlete?: {
    firstname?: string
    lastname?: string
    profile?: string
  }
}

export interface RefreshResponse {
  accessToken: string
  expiresAt: string
  tokenType: string
}

export interface MeResponse {
  user: User
  athlete: Pick<Athlete, 'id' | 'firstname' | 'lastname' | 'profile'> | null
  stravaConnected: boolean
  stravaTokenValid: boolean
}

// Legacy format types for compatibility with existing components
export interface LegacyTour {
  id: string
  name: string
  description?: string
  start_date: string
  end_date?: string
  isPublic: boolean
  activities?: {
    items: LegacyActivity[]
    nextToken?: string
  }
}

export interface LegacyActivity {
  id: string
  activity_type: string
  strava_id?: number
  summary_polyline?: string
  elapsed_time?: number
  moving_time?: number
  name?: string
  start_date?: string
  start_date_local?: string
  type?: string
  distance?: number
  total_elevation_gain?: number
}

export interface LegacyAthlete {
  id: string
  strava_id?: number
  firstname?: string
  lastname?: string
  profile?: string
  profile_medium?: string
  sex?: string
  city?: string
  state?: string
  country?: string
  date_preference?: string
  measurement_preference?: string
  weight?: number
  auth?: LegacyAuth
}

export interface LegacyAuth {
  id: string
  access_token: string
  refresh_token: string
  expires_at: number
  token_type: string
  strava_scope?: string
}
