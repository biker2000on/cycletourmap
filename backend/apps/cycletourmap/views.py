from django.shortcuts import render
from django.conf import settings


def index(request):
    context = {}
    context["client_id"] = settings.STRAVA_CLIENTID
    return render(request, "cycletourmap/index.html", context)
