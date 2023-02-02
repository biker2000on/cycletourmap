from os import access
from .models import StravaAuth
from apps.cycletourmap.models import Activity, Tour
import requests as r
from django.conf import settings
from datetime import datetime
from django.utils import timezone
from django.contrib.gis.geos import Point
import time
import logging

logger = logging.getLogger(__name__)


def get_token(user):
    """
    Get the access_token for Strava. If it is expired, refresh it
    first, then return the updated access_token.
    """
    auth = StravaAuth.objects.get(user=user)

    if timezone.now() > auth.expires_at:
        data = {
            "client_id": settings.STRAVA_CLIENTID,
            "client_secret": settings.STRAVA_CLIENT_SECRET,
            "refresh_token": auth.refresh_token,
            "grant_type": "refresh_token",
        }

        res = r.post("https://www.strava.com/oauth/token", json=data)

        res_data = res.json()

        auth.expires_at = datetime.fromtimestamp(res_data["expires_at"])
        auth.access_token = res_data["access_token"]
        auth.refresh_token = res_data["refresh_token"]
        auth.save()

    return auth.access_token


def get_strava_activities(user, tour, access_token, page=1, last_timestamp=0):

    resp = r.get(
        "https://www.strava.com/api/v3/athlete/activities",
        params={
            "per_page": 50,
            "page": page,
            # "before": tour.end_date,
            "after": last_timestamp,
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )
    activities = resp.json()
    return activities


def get_strava_activity_detail(activity_id, access_token):
    resp = r.get(
        f"https://www.strava.com/api/v3/activities/{activity_id}/streams",
        params={
            "keys": "time,distance,latlng,altitude,velocity_smooth,heartrate,cadence,watts,temp,moving,grade_smooth",
            "key_by_type": True,
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )
    activity = resp.json()
    return activity


def get_new_strava_activities(tour):
    page = 1
    access_token = get_token(tour.user)
    last_act = tour.activities.last()
    if last_act:
        last_timestamp = int(time.mktime(last_act.start_date.timetuple()))
    else:
        last_timestamp = int(time.mktime(Tour.start_date.timetuple()))
    activities = get_strava_activities(
        tour.user, tour, access_token, page=page, last_timestamp=last_timestamp
    )
    while True:
        for a in activities:

            act, created = Activity.objects.get_or_create(
                strava_id=a["id"], activity_type=a["type"], user=tour.user
            )

            if created:
                act.achievement_count = a.get("achievement_count", None)
                act.athlete_count = a.get("athlete_count", None)
                act.average_heartrate = a.get("average_heartrate", None)
                act.average_speed = a.get("average_speed", None)
                act.average_temp = a.get("average_temp", None)
                act.average_watts = a.get("average_watts", None)
                act.comment_count = a.get("comment_count", None)
                act.commute = a.get("commute", None)
                act.description = a.get("description", None)
                act.device_watts = a.get("device_watts", None)
                act.display_hide_heartrate_option = a.get(
                    "display_hide_heartrate_option", None
                )
                act.distance = a.get("distance", None)
                act.elapsed_time = a.get("elapsed_time", None)
                act.elev_high = a.get("elev_high", None)
                act.elev_low = a.get("elev_low", None)
                act.flagged = a.get("flagged", None)
                act.gear_id = a.get("gear_id", None)
                act.has_heartrate = a.get("has_heartrate", None)
                act.has_kudoed = a.get("has_kudoed", None)
                act.heartrate_opt_out = a.get("heartrate_opt_out", None)
                act.kilojoules = a.get("kilojoules", None)
                act.kudos_count = a.get("kudos_count", None)
                act.location_city = a.get("location_city", None)
                act.location_country = a.get("location_country", None)
                act.location_state = a.get("location_state", None)
                act.manual = a.get("manual", None)
                act.max_heartrate = a.get("max_heartrate", None)
                act.max_speed = a.get("max_speed", None)
                act.moving_time = a.get("moving_time", None)
                act.name = a.get("name", None)
                act.photo_count = a.get("photo_count", None)
                act.pr_count = a.get("pr_count", None)
                act.private = a.get("private", None)
                act.resource_state = a.get("resource_state", None)
                act.start_date = a.get("start_date", None)
                act.start_date_local = a.get("start_date_local", None)
                act.timezone = a.get("timezone", None)
                act.total_elevation_gain = a.get("total_elevation_gain", None)
                act.total_photo_count = a.get("total_photo_count", None)
                act.trainer = a.get("trainer", None)
                act.type = a.get("type", None)
                act.upload_id = a.get("upload_id", None)
                act.utc_offset = a.get("utc_offset", None)
                act.visibility = a.get("visibility", None)
                act.workout_type = a.get("workout_type", None)

                if start := a.get("start_latlng", None):
                    act.start_latlng = Point(start[1], start[0])

                if end := a.get("start_latlng", None):
                    act.end_latlng = Point(end[1], end[0])

                if map := a.get("map"):
                    act.polyline = map.get("polyline", None)
                    act.summary_polyline = map.get("summary_polyline", None)
                try:
                    act.save()
                except Exception as e:
                    logger.error(e)
                logger.info(f"Activity {act.strava_id} | {act.name} | saved")

        if len(activities) < 50:
            break
        page += 1
        logger.info(f"Page {page} of Strava activities")
        activities = get_strava_activities(
            tour.user, tour, access_token, page=page, last_timestamp=last_timestamp
        )
