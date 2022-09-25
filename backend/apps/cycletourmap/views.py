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
    access_token = get_token(request.user)
    tour = Tour.objects.get(id=tour_id)
    activities = get_strava_activities(request.user, tour, access_token)
    for a in activities:
        act, created = Activity.objects.get_or_create(
            strava_id=a["id"], activity_type=a["type"], user=request.user
        )
        if created:
            act.achievement_count = a["achievement_count"]
            act.athlete_count = a["athlete_count"]
            act.average_heartrate = a["average_heartrate"]
            act.average_speed = a["average_speed"]
            # act.average_temp = a["average_temp"]
            act.average_watts = a["average_watts"]
            act.comment_count = a["comment_count"]
            act.commute = a["commute"]
            # act.description = a["description"]
            act.device_watts = a["device_watts"]
            act.display_hide_heartrate_option = a["display_hide_heartrate_option"]
            act.distance = a["distance"]
            act.elapsed_time = a["elapsed_time"]
            act.elev_high = a["elev_high"]
            act.elev_low = a["elev_low"]
            act.end_latlng = Point(a["end_latlng"][1], a["end_latlng"][0])
            act.flagged = a["flagged"]
            act.gear_id = a["gear_id"]
            act.has_heartrate = a["has_heartrate"]
            act.has_kudoed = a["has_kudoed"]
            act.heartrate_opt_out = a["heartrate_opt_out"]
            act.kilojoules = a["kilojoules"]
            act.kudos_count = a["kudos_count"]
            act.location_city = a["location_city"]
            act.location_country = a["location_country"]
            act.location_state = a["location_state"]
            act.manual = a["manual"]
            act.summary_polyline = a["map"]["summary_polyline"]
            act.max_heartrate = a["max_heartrate"]
            act.max_speed = a["max_speed"]
            act.moving_time = a["moving_time"]
            act.name = a["name"]
            act.photo_count = a["photo_count"]
            act.pr_count = a["pr_count"]
            act.private = a["private"]
            act.resource_state = a["resource_state"]
            act.start_date = a["start_date"]
            act.start_date_local = a["start_date_local"]
            act.start_latlng = Point(a["start_latlng"][1], a["start_latlng"][0])
            act.timezone = a["timezone"]
            act.total_elevation_gain = a["total_elevation_gain"]
            act.total_photo_count = a["total_photo_count"]
            act.trainer = a["trainer"]
            act.type = a["type"]
            act.upload_id = a["upload_id"]
            act.utc_offset = a["utc_offset"]
            act.visibility = a["visibility"]
            act.workout_type = a["workout_type"]

            act.save()

    return HttpResponse(status=204)
