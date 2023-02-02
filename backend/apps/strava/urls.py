from django.urls import path
from . import views

app_name = "strava"
urlpatterns = [
    path("", views.index, name="index"),
    path("exchange_token", views.exchange_token, name="exchange_token"),
    path("webhook/setup", views.webhook_setup, name="webhook"),
    path("webhook/create", views.delete_subscription, name="webhook_create"),
    path("webhook/delete", views.delete_subscription, name="webhook_delete"),
    path("webhook/listener", views.listener, name="listener"),
]
