from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("tour", views.tour, name="tour"),
    path("tour/form", views.tour_modal, name="tour_modal"),
    path("tour/list", views.tour_list, name="tour_list"),
    path("tour/submit", views.tour_submit, name="tourform"),
    path("tour/<tour_id>", views.tour_submit, name="tour_view"),
    path("tour/<tour_id>/edit", views.tour_modal, name="tour_edit"),
    path("tour/<tour_id>/delete", views.tour_delete, name="tour_delete"),
]
