# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.conf import settings
from django_extensions.db.models import TimeStampedModel
from django.contrib.gis.db import models


class Activity(TimeStampedModel, models.Model):
    id = models.UUIDField(primary_key=True)
    activity_type = models.CharField(max_length=20)
    strava_id = models.IntegerField(blank=True, null=True)
    achievement_count = models.IntegerField(blank=True, null=True)
    athlete_count = models.IntegerField(blank=True, null=True)
    average_heartrate = models.IntegerField(blank=True, null=True)
    average_speed = models.IntegerField(blank=True, null=True)
    average_temp = models.FloatField(blank=True, null=True)
    average_watts = models.IntegerField(blank=True, null=True)
    comment_count = models.IntegerField(blank=True, null=True)
    commute = models.BooleanField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    device_watts = models.FloatField(blank=True, null=True)
    display_hide_heartrate_option = models.BooleanField(blank=True, null=True)
    distance = models.FloatField(blank=True, null=True)
    elapsed_time = models.FloatField(blank=True, null=True)
    elev_high = models.FloatField(blank=True, null=True)
    elev_low = models.FloatField(blank=True, null=True)
    end_latlng = models.TextField(blank=True, null=True)
    flagged = models.BooleanField(blank=True, null=True)
    gear_id = models.IntegerField(blank=True, null=True)
    has_heartrate = models.BooleanField(blank=True, null=True)
    has_kudoed = models.BooleanField(blank=True, null=True)
    heartrate_opt_out = models.BooleanField(blank=True, null=True)
    kilojoules = models.IntegerField(blank=True, null=True)
    kudos_count = models.IntegerField(blank=True, null=True)
    location_city = models.TextField(blank=True, null=True)
    location_country = models.TextField(blank=True, null=True)
    location_state = models.TextField(blank=True, null=True)
    manual = models.BooleanField(blank=True, null=True)
    summary_polyline = models.TextField(blank=True, null=True)
    max_heartrate = models.IntegerField(blank=True, null=True)
    max_speed = models.FloatField(blank=True, null=True)
    moving_time = models.FloatField(blank=True, null=True)
    name = models.TextField(blank=True, null=True)
    photo_count = models.IntegerField(blank=True, null=True)
    pr_count = models.IntegerField(blank=True, null=True)
    private = models.BooleanField(blank=True, null=True)
    resource_state = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    start_date_local = models.DateTimeField(blank=True, null=True)
    start_latitude = models.FloatField(blank=True, null=True)
    start_longitude = models.FloatField(blank=True, null=True)
    start_latlng = models.PointField(blank=True, null=True)
    timezone = models.TextField(blank=True, null=True)
    total_elevation_gain = models.FloatField(blank=True, null=True)
    total_photo_count = models.IntegerField(blank=True, null=True)
    trainer = models.BooleanField(blank=True, null=True)
    type = models.TextField(blank=True, null=True)
    upload_id = models.IntegerField(blank=True, null=True)
    utc_offset = models.TextField(blank=True, null=True)
    visibility = models.BooleanField(blank=True, null=True)
    workout_type = models.TextField(blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "activity"


class Tour(TimeStampedModel, models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    tours = models.ManyToManyField(
        Activity, related_name="tours", db_table="tour_activities"
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "tour"
