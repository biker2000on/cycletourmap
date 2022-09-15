from django.db import models
from django_extensions.db.models import TimeStampedModel
from django.conf import settings
import uuid


class StravaAuth(TimeStampedModel, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    access_token = models.CharField(max_length=70)
    expires_at = models.DateTimeField(null=True)
    refresh_token = models.CharField(max_length=70, null=True)
    token_type = models.CharField(max_length=250)
    strava_scope = models.CharField(max_length=250, null=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "strava_auth"
