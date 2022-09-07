from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("exchange_token", views.exchange_token, name="exchange_token"),
]
