from django.contrib import admin
from django.urls import include, path
from apps.cycletourmap.views import TourList

urlpatterns = [
    path("strava/", include("apps.strava.urls")),
    path("tour/", include("apps.cycletourmap.urls")),
    path("admin/", admin.site.urls),
    path("", include("apps.authentication.urls")),
    path("", TourList.as_view(), name="index"),
    path("", include("apps.home.urls")),
]
