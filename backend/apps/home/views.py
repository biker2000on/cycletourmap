# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from django import template
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.urls import reverse
from django.conf import settings
import requests as r


@login_required(login_url="/login/")
def index(request):
    context = {"segment": "index"}

    html_template = loader.get_template("home/index.html")
    return HttpResponse(html_template.render(context, request))


@login_required(login_url="/login/")
def pages(request, resource):
    context = {}
    context["client_id"] = settings.STRAVA_CLIENTID
    # All resource paths end in .html.
    # Pick out the html file name from the url. And load that template.
    try:

        # path = resource
        # load_template = path[-1]

        if resource == "admin":
            return HttpResponseRedirect(reverse("admin:index"))
        context["segment"] = resource

        html_template = loader.get_template("home/" + resource)
        return HttpResponse(html_template.render(context, request))

    except template.TemplateDoesNotExist:

        html_template = loader.get_template("home/page-404.html")
        return HttpResponse(html_template.render(context, request))

    except Exception as e:
        print(e)
        html_template = loader.get_template("home/page-500.html")
        return HttpResponse(html_template.render(context, request))
