/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTour = `query GetTour($id: ID!) {
  getTour(id: $id) {
    id
    name
    description
    start_date
    end_date
    isPublic
    owner
    activities {
      items {
        id
        activity_type
        strava_id
        achievement_count
        athlete_count
        average_heartrate
        average_speed
        average_temp
        average_watts
        comment_count
        commute
        description
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
        max_heartrate
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
        owner
      }
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
      name
      description
      start_date
      end_date
      isPublic
      owner
      activities {
        nextToken
      }
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
    achievement_count
    athlete_count
    average_heartrate
    average_speed
    average_temp
    average_watts
    comment_count
    commute
    description
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
    max_heartrate
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
    tour {
      id
      name
      description
      start_date
      end_date
      isPublic
      owner
      activities {
        nextToken
      }
    }
    owner
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
      athlete_count
      average_heartrate
      average_speed
      average_temp
      average_watts
      comment_count
      commute
      description
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
      max_heartrate
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
      tour {
        id
        name
        description
        start_date
        end_date
        isPublic
        owner
      }
      owner
    }
    nextToken
  }
}
`;
export const listActivitiesByStravaId = `query ListActivitiesByStravaId(
  $strava_id: ID
  $sortDirection: ModelSortDirection
  $filter: ModelActivityFilterInput
  $limit: Int
  $nextToken: String
) {
  listActivitiesByStravaId(
    strava_id: $strava_id
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      activity_type
      strava_id
      achievement_count
      athlete_count
      average_heartrate
      average_speed
      average_temp
      average_watts
      comment_count
      commute
      description
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
      max_heartrate
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
      tour {
        id
        name
        description
        start_date
        end_date
        isPublic
        owner
      }
      owner
    }
    nextToken
  }
}
`;
export const getAthlete = `query GetAthlete($id: ID!) {
  getAthlete(id: $id) {
    id
    strava_id
    firstname
    lastname
    profile
    profile_medium
    sex
    city
    state
    country
    date_preference
    measurement_preference
    weight
    tours {
      items {
        id
        name
        description
        start_date
        end_date
        isPublic
        owner
      }
      nextToken
    }
    owner
    auth {
      id
      access_token
      expires_at
      refresh_token
      token_type
      strava_scope
      owner
    }
  }
}
`;
export const listAthletes = `query ListAthletes(
  $filter: ModelAthleteFilterInput
  $limit: Int
  $nextToken: String
) {
  listAthletes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      strava_id
      firstname
      lastname
      profile
      profile_medium
      sex
      city
      state
      country
      date_preference
      measurement_preference
      weight
      tours {
        nextToken
      }
      owner
      auth {
        id
        access_token
        expires_at
        refresh_token
        token_type
        strava_scope
        owner
      }
    }
    nextToken
  }
}
`;
export const getAthleteByStravaId = `query GetAthleteByStravaId(
  $strava_id: ID
  $sortDirection: ModelSortDirection
  $filter: ModelAthleteFilterInput
  $limit: Int
  $nextToken: String
) {
  getAthleteByStravaId(
    strava_id: $strava_id
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      strava_id
      firstname
      lastname
      profile
      profile_medium
      sex
      city
      state
      country
      date_preference
      measurement_preference
      weight
      tours {
        nextToken
      }
      owner
      auth {
        id
        access_token
        expires_at
        refresh_token
        token_type
        strava_scope
        owner
      }
    }
    nextToken
  }
}
`;
export const listAuths = `query ListAuths(
  $filter: ModelAuthFilterInput
  $limit: Int
  $nextToken: String
) {
  listAuths(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      access_token
      expires_at
      refresh_token
      token_type
      strava_scope
      owner
    }
    nextToken
  }
}
`;
export const getAuth = `query GetAuth($id: ID!) {
  getAuth(id: $id) {
    id
    access_token
    expires_at
    refresh_token
    token_type
    strava_scope
    owner
  }
}
`;
