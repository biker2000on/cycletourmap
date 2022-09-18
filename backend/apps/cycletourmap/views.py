from multiprocessing import context
from django.shortcuts import render
from django.conf import settings
from .forms import TourForm
from .models import Tour
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.shortcuts import redirect


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


@login_required(login_url="/login/")
def tour_modal(request, tour_id=None):
    context = {}
    context["form"] = TourForm()

    return render(request, "components/tour-form.html", context)


@login_required(login_url="/login/")
@require_http_methods(["GET", "POST"])
def tour_submit(request):
    form = TourForm(data=request.POST)
    if form.is_valid():
        form = form.save(commit=False)
        form.user = request.user
        form.save()

    return redirect("tour", form.id)
