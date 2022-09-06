from django.db import models
from django_extensions.db.models import TimeStampedModel
from django.conf import settings


class StravaAuth(TimeStampedModel, models.Model):
    id = models.UUIDField(primary_key=True)
    access_token = models.TextField()
    expires_at = models.DateTimeField()
    refresh_token = models.TextField()
    token_type = models.TextField()
    strava_scope = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "strava_auth"
