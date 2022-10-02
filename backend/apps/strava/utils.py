from os import access
from .models import StravaAuth
from apps.cycletourmap.models import Activity
import requests as r
from django.conf import settings
from datetime import datetime
from django.utils import timezone


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
