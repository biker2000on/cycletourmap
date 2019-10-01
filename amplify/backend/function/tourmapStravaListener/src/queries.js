const getAthleteAll = `query getAthleteAll {
  getAthleteByStravaId(strava_id: $strava_id, filter: $filter, limit: $limit) {
    items {
      id
      strava_id
      firstname
      lastname
      owner
      auth {
        id
        access_token
        expires_at
        refresh_token
        owner
      }
      tours(limit: 200) {
        items {
          id
          name
          start_date
          end_date
        }
      }
    }
  }
}
`

const updateAuth = `mutation UpdateAuth($input: UpdateAuthInput!) {
  updateAuth(input: $input) {
    id
    access_token
    expires_at
    refresh_token
    token_type
    strava_scope
  }
}
`

const createActivity = `mutation CreateActivity($input: CreateActivityInput!) {
  createActivity(input: $input) {
    id
    name
    distance
    elapsed_time
    moving_time
    start_latlng
    start_date_local
    summary_polyline
    type
    strava_id
  }
}`

const updateActivity = `mutation UpdateActivity($input: UpdateActivityInput!) {
  updateActivity(input: $input) {
    id
    name
    distance
    elapsed_time
    moving_time
    start_latlng
    start_date_local
    summary_polyline
    type
    strava_id
  }
}`

const deleteActivity = `mutation DeleteActivity($input: DeleteActivityInput!) {
  deleteActivity(input: $input) {
    id
  }
}`

const getActivityByStravaId = `query ListActivitiesByStravaId($strava_id: ID!) {
  listActivitiesByStravaId(strava_id: $strava_id) {
    items {
      id
      name
      strava_id
    }
  }
}`

const updateAthlete = `mutation UpdateAthlete($input: UpdateAthleteInput!) {
  updateAthlete(input: $input) {
    id
    strava_id
    firstname
    lastname
    profile
    __typename
  }
}`

const deleteAthlete = `mutation DeleteAthlete($input: DeleteAthleteInput!) {
  deleteAthlete(input: $input) {
    id
  }
}`

module.exports = {
  getAthleteAll,
  deleteActivity,
  updateAuth,
  createActivity,
  updateActivity,
  getActivityByStravaId,
  updateAthlete,
  deleteAthlete,
}