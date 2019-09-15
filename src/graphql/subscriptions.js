/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTour = `subscription OnCreateTour {
  onCreateTour {
    id
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
export const onUpdateTour = `subscription OnUpdateTour {
  onUpdateTour {
    id
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
export const onDeleteTour = `subscription OnDeleteTour {
  onDeleteTour {
    id
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
export const onCreateActivity = `subscription OnCreateActivity {
  onCreateActivity {
    id
    activity_type
    strava_id
    tour {
      id
      name
      description
      start_date
      end_date
      isPublic
    }
    achievement_count
    athlete_count
    average_heartrate
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
  }
}
`;
export const onUpdateActivity = `subscription OnUpdateActivity {
  onUpdateActivity {
    id
    activity_type
    strava_id
    tour {
      id
      name
      description
      start_date
      end_date
      isPublic
    }
    achievement_count
    athlete_count
    average_heartrate
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
  }
}
`;
export const onDeleteActivity = `subscription OnDeleteActivity {
  onDeleteActivity {
    id
    activity_type
    strava_id
    tour {
      id
      name
      description
      start_date
      end_date
      isPublic
    }
    achievement_count
    athlete_count
    average_heartrate
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
  }
}
`;
export const onCreateAthlete = `subscription OnCreateAthlete {
  onCreateAthlete {
    id
    firstname
    lastname
    profile
    profile_medium
    sex
    city
    state
    country
  }
}
`;
export const onUpdateAthlete = `subscription OnUpdateAthlete {
  onUpdateAthlete {
    id
    firstname
    lastname
    profile
    profile_medium
    sex
    city
    state
    country
  }
}
`;
export const onDeleteAthlete = `subscription OnDeleteAthlete {
  onDeleteAthlete {
    id
    firstname
    lastname
    profile
    profile_medium
    sex
    city
    state
    country
  }
}
`;
export const onCreateAuth = `subscription OnCreateAuth {
  onCreateAuth {
    id
    access_token
    expires_at
    refresh_token
    token_type
    strava_scope
  }
}
`;
export const onUpdateAuth = `subscription OnUpdateAuth {
  onUpdateAuth {
    id
    access_token
    expires_at
    refresh_token
    token_type
    strava_scope
  }
}
`;
export const onDeleteAuth = `subscription OnDeleteAuth {
  onDeleteAuth {
    id
    access_token
    expires_at
    refresh_token
    token_type
    strava_scope
  }
}
`;
