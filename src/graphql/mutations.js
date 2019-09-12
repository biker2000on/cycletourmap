/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTour = `mutation CreateTour($input: CreateTourInput!) {
  createTour(input: $input) {
    id
    user {
      id
      username
    }
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
export const updateTour = `mutation UpdateTour($input: UpdateTourInput!) {
  updateTour(input: $input) {
    id
    user {
      id
      username
    }
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
export const deleteTour = `mutation DeleteTour($input: DeleteTourInput!) {
  deleteTour(input: $input) {
    id
    user {
      id
      username
    }
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
export const createActivity = `mutation CreateActivity($input: CreateActivityInput!) {
  createActivity(input: $input) {
    id
    activity_type
    strava_id
    athlete {
      id
      username
    }
    tour {
      id
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
export const updateActivity = `mutation UpdateActivity($input: UpdateActivityInput!) {
  updateActivity(input: $input) {
    id
    activity_type
    strava_id
    athlete {
      id
      username
    }
    tour {
      id
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
export const deleteActivity = `mutation DeleteActivity($input: DeleteActivityInput!) {
  deleteActivity(input: $input) {
    id
    activity_type
    strava_id
    athlete {
      id
      username
    }
    tour {
      id
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
export const createUser = `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    username
    tours {
      nextToken
    }
    activities {
      nextToken
    }
  }
}
`;
export const updateUser = `mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    username
    tours {
      nextToken
    }
    activities {
      nextToken
    }
  }
}
`;
export const deleteUser = `mutation DeleteUser($input: DeleteUserInput!) {
  deleteUser(input: $input) {
    id
    username
    tours {
      nextToken
    }
    activities {
      nextToken
    }
  }
}
`;
