from django.urls import path
from . import views

urlpatterns = [
    path("", views.TourList.as_view(), name="index"),
    path("tour/create", views.TourCreate.as_view(), name="tour_create"),
    path("tour/list", views.tour_list, name="tour_list"),
    path("tour/<pk>", views.TourDetail.as_view(), name="tour_view"),
    path("tour/<pk>/edit", views.TourUpdate.as_view(), name="tour_edit"),
    path("tour/<tour_id>/delete", views.tour_delete, name="tour_delete"),
    path("msg", views.send_message, name="message"),
]
