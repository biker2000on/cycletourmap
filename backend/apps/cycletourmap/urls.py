from django.urls import path
from . import views

app_name = "cycletourmap"
urlpatterns = [
    path("", views.TourList.as_view(), name="index"),
    path("tour/create", views.TourCreate.as_view(), name="tour_create"),
    path("tour/list", views.tour_list, name="tour_list"),
    path("tour/<pk>", views.TourDetail.as_view(), name="tour_view"),
    path("tour/<pk>/edit", views.TourUpdate.as_view(), name="tour_edit"),
    path("tour/<tour_id>/delete", views.tour_delete, name="tour_delete"),
    path("tour/<tour_id>/activities", views.get_activities, name="tour_activities"),
    path(
        "activity/<activity_id>/detail",
        views.get_activity_detail,
        name="activity_detail",
    ),
    path("msg", views.send_message, name="message"),
    path("<tour_id>/map/activities", views.map_activity_data, name="map_activities"),
    path("<tour_id>/map", views.tourmap, name="map"),
]
