from django.apps import AppConfig


class StravaListenerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.strava"
    label = "strava"
