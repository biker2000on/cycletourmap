from django.urls import path
from . import views

app_name = "cycletourmap"
urlpatterns = [
    path("", views.TourList.as_view(), name="index"),
    path("create", views.TourCreate.as_view(), name="tour_create"),
    path("list", views.tour_list, name="tour_list"),
    path("<pk>", views.TourDetail.as_view(), name="tour_view"),
    path("<pk>/edit", views.TourUpdate.as_view(), name="tour_edit"),
    path("<tour_id>/delete", views.tour_delete, name="tour_delete"),
    path("<tour_id>/activities", views.get_activities, name="tour_activities"),
    path(
        "<tour_id>/activities/edit",
        views.tour_activities_edit,
        name="tour_activities_edit",
    ),
    path(
        "<tour_id>/activities/<activity_id>",
        views.tour_activity_update,
        name="tour_activities_update",
    ),
    path(
        "activity/<activity_id>/detail",
        views.get_activity_detail,
        name="activity_detail",
    ),
    path("msg", views.send_message, name="message"),
    path("<tour_id>/map/activities", views.map_activity_data, name="map_activities"),
    path("<tour_id>/map", views.tourmap, name="map"),
]
