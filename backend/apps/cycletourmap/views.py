from multiprocessing import context
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib.messages import get_messages
from .models import Tour, Activity
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
import json
from apps.strava.utils import get_token, get_strava_activities
from django.contrib.gis.geos import Point


@login_required(login_url="/login/")
def index(request):
    context = {}
    context["client_id"] = settings.STRAVA_CLIENTID
    return render(request, "cycletourmap/index.html", context)


class TourList(ListView):
    model = Tour
    allow_empty = True

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["client_id"] = settings.STRAVA_CLIENTID
        return context


@login_required(login_url="/login/")
def tour_list(request):
    context = {}
    context["object_list"] = Tour.objects.filter(user=request.user)
    return render(request, "components/tour-table-body.html", context)


class TourDetail(DetailView):
    model = Tour


class TourCreate(SuccessMessageMixin, CreateView):
    model = Tour
    fields = ["name", "description", "start_date", "end_date", "is_public"]
    success_message = "%(name)s was successfully submitted"
    success_url = "/tour/msg"
    template_name_suffix = "_create_form"

    def form_valid(self, form):
        form.instance.user_id = self.request.user.pk
        form.save()
        return super().form_valid(form)


class TourUpdate(SuccessMessageMixin, UpdateView):
    model = Tour
    fields = ["name", "description", "start_date", "end_date", "is_public"]
    success_message = "%(name)s was successfully updated"
    success_url = "/tour/msg"
    template_name_suffix = "_update_form"


@login_required
@require_http_methods(["DELETE"])
def tour_delete(request, tour_id):
    Tour.objects.get(id=tour_id).delete()
    return HttpResponse(status=204, headers={"HX-Trigger": "tourListChanged"})


def send_message(request, message=None):
    message = get_messages(request)

    return HttpResponse(
        status=204,
        headers={
            "HX-Trigger": json.dumps(
                {
                    "tourListChanged": None,
                    "showMessage": message._loaded_messages[-1].message,
                }
            )
        },
    )


def get_activities(request, tour_id):
    context = {}
    access_token = get_token(request.user)
    tour = Tour.objects.get(id=tour_id)
    activities = get_strava_activities(request.user, tour, access_token)
    for a in activities:

        act, created = Activity.objects.get_or_create(
            strava_id=a["id"], activity_type=a["type"], user=request.user
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

            act.save()
    context["activities"] = Activity.objects.all()
    return render(request, "cycletourmap/activity-table.html", context)
