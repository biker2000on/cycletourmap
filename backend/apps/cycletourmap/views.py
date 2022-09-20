from multiprocessing import context
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.contrib.messages.views import SuccessMessageMixin
from .models import Tour
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
import json


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
    message = request._messages._loaded_messages[-1].message

    return HttpResponse(
        status=204,
        headers={
            "HX-Trigger": json.dumps({"tourListChanged": None, "showMessage": message})
        },
    )
