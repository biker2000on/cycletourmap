/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTour = `query GetTour($id: ID!) {
  getTour(id: $id) {
    id
    user
    name
    description
    start_date
    end_date
    isPublic
    activities {
      nextToken
    }
  }
}
`;
export const listTours = `query ListTours(
  $filter: ModelTourFilterInput
  $limit: Int
  $nextToken: String
) {
  listTours(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      user
      name
      description
      start_date
      end_date
      isPublic
    }
    nextToken
  }
}
`;
export const getActivity = `query GetActivity($id: ID!) {
  getActivity(id: $id) {
    id
    activity_type
    strava_id
    athlete {
      id
      username
    }
    tour {
      id
      user
      name
      description
      start_date
      end_date
      isPublic
    }
    achievement_count
    average_speed
    average_temp
    average_watts
    comment_count
    commute
    device_watts
    display_hide_heartrate_option
    distance
    elapsed_time
    elev_high
    elev_low
    end_latlng
    flagged
    gear_id
    has_heartrate
    has_kudoed
    heartrate_opt_out
    kilojoules
    kudos_count
    location_city
    location_country
    location_state
    manual
    summary_polyline
    max_speed
    moving_time
    name
    photo_count
    pr_count
    private
    resource_state
    start_date
    start_date_local
    start_latitude
    start_longitude
    start_latlng
    timezone
    total_elevation_gain
    total_photo_count
    trainer
    type
    upload_id
    utc_offset
    visibility
    workout_type
  }
}
`;
export const listActivitys = `query ListActivitys(
  $filter: ModelActivityFilterInput
  $limit: Int
  $nextToken: String
) {
  listActivitys(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      activity_type
      strava_id
      achievement_count
      average_speed
      average_temp
      average_watts
      comment_count
      commute
      device_watts
      display_hide_heartrate_option
      distance
      elapsed_time
      elev_high
      elev_low
      end_latlng
      flagged
      gear_id
      has_heartrate
      has_kudoed
      heartrate_opt_out
      kilojoules
      kudos_count
      location_city
      location_country
      location_state
      manual
      summary_polyline
      max_speed
      moving_time
      name
      photo_count
      pr_count
      private
      resource_state
      start_date
      start_date_local
      start_latitude
      start_longitude
      start_latlng
      timezone
      total_elevation_gain
      total_photo_count
      trainer
      type
      upload_id
      utc_offset
      visibility
      workout_type
    }
    nextToken
  }
}
`;
export const getUser = `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    tours {
      id
      user
      name
      description
      start_date
      end_date
      isPublic
    }
    activities {
      nextToken
    }
  }
}
`;
export const listUsers = `query ListUsers(
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      username
    }
    nextToken
  }
}
`;
