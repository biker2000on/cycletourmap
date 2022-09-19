from multiprocessing import context
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from .forms import TourForm
from .models import Tour
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.shortcuts import redirect
import json


@login_required(login_url="/login/")
def index(request):
    context = {}
    context["client_id"] = settings.STRAVA_CLIENTID
    context["tours"] = Tour.objects.filter(user=request.user).all()
    return render(request, "cycletourmap/index.html", context)


@login_required(login_url="/login/")
def tour(request, tour_id=None):
    context = {}
    context["form"] = TourForm()

    return render(request, "cycletourmap/tour.html", context)


@login_required
@require_http_methods(["DELETE"])
def tour_delete(request, tour_id):
    Tour.objects.get(id=tour_id).delete()
    return HttpResponse(status=204, headers={"HX-Trigger": "tourListChanged"})


@login_required(login_url="/login/")
def tour_modal(request, tour_id=None):
    context = {}
    if tour_id:
        context["form"] = TourForm(instance=Tour.objects.get(id=tour_id))
    else:
        context["form"] = TourForm()

    return render(request, "components/tour-form.html", context)


@login_required
def tour_list(request):
    context = {}
    context["tours"] = Tour.objects.filter(user=request.user).all()
    return render(request, "components/tour-table-body.html", context)


@login_required(login_url="/login/")
@require_http_methods(["GET", "POST"])
def tour_submit(request, tour_id=None):
    form = TourForm(data=request.POST)
    if form.is_valid():
        if tour_id:
            form.id = tour_id
        form = form.save(commit=False)
        form.user = request.user
        form.save()

        return HttpResponse(
            status=204,
            headers={
                "HX-Trigger": json.dumps(
                    {"tourListChanged": None, "showMessage": f"{form.name} submitted."}
                )
            },
        )
    return render(request, "components/tour-form.html", {"form": form})
