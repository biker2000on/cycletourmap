from django.db import models
from django_extensions.db.models import TimeStampedModel
from django.conf import settings
import uuid


class StravaAuth(TimeStampedModel, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    access_token = models.TextField()
    expires_at = models.DateTimeField(null=True)
    refresh_token = models.TextField(null=True)
    token_type = models.TextField()
    strava_scope = models.TextField(null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "strava_auth"
