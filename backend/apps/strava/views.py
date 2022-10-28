from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
import requests as r
from .models import StravaAuth
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@login_required(login_url="/login/")
def index(request):
    context = {"client_id": settings.STRAVA_CLIENTID}
    return render(request, "home/dashboard.html", context)


@login_required(login_url="/login/")
def exchange_token(request):
    context = {}

    code = request.GET["code"]
    scope = request.GET["scope"]

    payload = {
        "client_id": settings.STRAVA_CLIENTID,
        "client_secret": settings.STRAVA_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
    }
    res = r.post("https://www.strava.com/oauth/token", data=payload)
    data = res.json()

    request.user.first_name = data["athlete"]["firstname"]
    request.user.last_name = data["athlete"]["lastname"]
    request.user.profile = data["athlete"]["profile"]
    request.user.profile_medium = data["athlete"]["profile_medium"]
    request.user.sex = data["athlete"]["sex"]
    request.user.city = data["athlete"]["city"]
    request.user.state = data["athlete"]["state"]
    request.user.country = data["athlete"]["country"]
    request.user.save()

    auth, isCreated = StravaAuth.objects.get_or_create(
        access_token=data["access_token"],
        token_type=data["token_type"],
        user=request.user,
    )

    auth.expires_at = datetime.fromtimestamp(data["expires_at"])
    auth.refresh_token = data["refresh_token"]
    auth.strava_scope = scope
    auth.save()

    return redirect("/map/")


@login_required(login_url="/login/")
def webhook_setup(request):
    context = {}
    res = r.get(
        "https://www.strava.com/api/v3/push_subscriptions",
        params={
            "client_id": settings.STRAVA_CLIENTID,
            "client_secret": settings.STRAVA_CLIENT_SECRET,
        },
    )
    data = r.json()
    if len(data):
        context["webhooks"] = data


def create_subscription(request):
    context = {}
    context["verify_token"] = settings.STRAVA_VERIFY_TOKEN
    context["client_id"] = settings.STRAVA_CLIENTID
    context["client_secret"] = settings.STRAVA_CLIENT_SECRET
    res = r.get(
        "https://www.strava.com/api/v3/push_subscriptions",
        params={
            "client_id": settings.STRAVA_CLIENTID,
            "client_secret": settings.STRAVA_CLIENT_SECRET,
            "callback_url": "https://cycletourmap.com/" + reverse("strava:listener"),
            "verify_token": settings.STRAVA_VERIFY_TOKEN,
        },
    )

    redirect("strava:webhook")


def view_subscription(request):
    pass


def delete_subscription(request, id):
    pass


def listener(request):
    if request.GET:
        if "hub.challenge" in request.GET.keys():
            logger.info(f"Subscription setup: {request.GET['hub.challenge']}")
            return JsonResponse({"hub.challenge": request.GET["hub.challenge"]})
        else:
            return HttpResponse(status=500)
    if request.POST:
        pass
