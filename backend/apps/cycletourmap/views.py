from multiprocessing import context
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib.messages import get_messages
from .models import Tour, Activity, Activity_Detail
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.core.serializers import serialize
from django.db.models import Q
from django.contrib.auth.mixins import LoginRequiredMixin
import json
from apps.strava.utils import (
    get_new_strava_activities,
    get_token,
    get_strava_activities,
    get_strava_activity_detail,
)
from django.contrib.gis.geos import Point
import time
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


@login_required(login_url="/login/")
def index(request):
    context = {}
    context["client_id"] = settings.STRAVA_CLIENTID
    return render(request, "cycletourmap/index.html", context)


class TourList(LoginRequiredMixin, ListView):
    model = Tour
    allow_empty = True
    login_url = "/login/"
    redirect_field_name = "redirect_to"

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

    tour = Tour.objects.get(id=tour_id)

    start = tour.start_date
    if len(tour.activities.all()) > 0:
        start = tour.activities.last().start_date
    if tour.end_date:
        if start + timedelta(1) < tour.end_date:
            acts = Activity.objects.filter(
                user=tour.user,
                start_date__gte=start,
                start_date__lte=tour.end_date + timedelta(seconds=3600 * 24 - 1),
            )
            tour.activities.add(*acts)
            tour.save()

    else:
        acts = Activity.objects.filter(user=tour.user, start_date__gte=start).order_by(
            "-start_date"
        )
        tour.activities.add(*acts)
        tour.save()
    if (
        len(Activity.objects.filter(user=request.user, start_date__gte=tour.end_date))
        == 0
    ):
        get_new_strava_activities(tour)

    context["activities"] = tour.activities.all()
    return render(request, "cycletourmap/activity-table.html", context)


def tour_activities_edit(request, tour_id):
    context = {}
    # TODO handle request.DELETE
    # TODO handle request.POST
    try:
        tour = Tour.objects.get(id=tour_id)
        context["tour"] = tour
    except Tour.DoesNotExist:
        return

    activities = tour.activities.all()
    query = Q(id__in=[a.id for a in activities])
    context["activities"] = activities
    context["unused"] = Activity.objects.filter(
        ~query,
        user=request.user,
        start_date__gte=tour.start_date,
        start_date__lte=tour.end_date,
    )
    return render(request, "cycletourmap/tour-activity-edit.html", context)


def tour_activity_update(request, tour_id, activity_id):
    try:
        tour = Tour.objects.get(id=tour_id)
    except Tour.DoesNotExist:
        return
    try:
        act = Activity.objects.get(id=activity_id)
    except Activity.DoesNotExist:
        return
    if request.method == "POST":
        tour.activities.add(act)

    if request.method == "DELETE":
        tour.activities.remove(act)
    return HttpResponse(status=204, headers={"HX-Trigger": "activities_updated"})


def tourmap(request, tour_id):
    context = {}
    tour = Tour.objects.get(id=tour_id)
    context["tour"] = tour

    return render(request, "cycletourmap/map.html", context)


def map_activity_data(request, tour_id):
    context = {}
    tour = Tour.objects.get(id=tour_id)
    activities = tour.activities.all()
    act_json = [
        {"id": a.id, "polyline": a.summary_polyline, "a.start_latlng": a.start_latlng}
        for a in activities
    ]
    test = serialize(
        "geojson",
        activities,
        geometry_field="start_latlng",
        fields=(
            "id",
            "summary_polyline",
            "start_date",
            "name",
            "distance",
            "moving_time",
            "elapsed_time",
            "average_speed",
        ),
    )

    return JsonResponse(json.loads(test), safe=False)


def get_activity_detail(request, activity_id):
    context = {}
    activity = Activity.objects.get(id=activity_id)
    access_token = get_token(request.user)
    streamset = get_strava_activity_detail(activity.strava_id, access_token)
    data_cols = streamset.keys()
    # TODO: come back here and design algorithm for save
    data = [streamset[key]["data"] for key in data_cols]
    # for  in :
    #     detail = Activity_Detail.objects.create(time=val, activity=activity)
    #     detail.temperature = streamset.get('temp').data[i]
    #     detail.watts = streamset.get('watts').data[i]
    #     detail.moving = streamset.get('moving').data[i]
    #     detail.latlng = streamset.get('latlng').data[i]
    #     detail.velocity_smooth = streamset.get('velocity_smooth').data[i]
    #     detail.grade_smooth = streamset.get('grade_smooth').data[i]
    #     detail.cadence = streamset.get('cadence').data[i]
    #     detail.distance = streamset.get('distance').data[i]
    #     detail.heartrate = streamset.get('heartrate').data[i]
    #     detail.altitude = streamset.get('altitude').data[i]


# TODO view to remove items from tour
# this view should also work from the map view on singles.
# TODO add google mutant for Google map layers https://gitlab.com/IvanSanchez/Leaflet.GridLayer.GoogleMutant
