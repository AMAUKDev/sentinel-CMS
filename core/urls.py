"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views
from core import request_logic, test_views
urlpatterns = [
    path('admin/', admin.site.urls),

    path('async_interpretations_view/',
         views.async_interpretations_view,
         name='async_interpretations_view'
         ),
    path("callback_view/",
         request_logic.callback_view,
         name="callback_view"
         ),
    path("check_request_status/",
         request_logic.check_request_status,
         name="check_request_status"
         ),
    path("test_get_interpretations/",
         test_views.test_get_interpretations,
         name="test_get_interpretations"),
    path("test_display_interpretation/",
         test_views.test_display_interpretation,
         name="test_display_interpretation"),

    path('', include(("users.urls", "users"), "users")),
] + static(settings.STATIC_URL)
