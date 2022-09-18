from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("tour", views.tour, name="tour"),
    path("tour-form", views.tour_modal, name="tour_modal"),
    path("tour/submit", views.tour_submit, name="tourform"),
]
