from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("tour", views.tour, name="tour"),
    path("tour/submit", views.tour_submit, name="tourform"),
]
