"""
URL configuration for Backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import path
from Backend import api_views

urlpatterns = [
    path('admin/', admin.site.urls),
    # RESTful API endpoints
    path('api/users/', api_views.users_collection, name='api-users'),
    path('api/sessions/', api_views.login, name='api-sessions'),
    path('api/users/password/', api_views.change_password, name='api-change-password'),
    # Google OAuth endpoints
    path('api/google/auth/', api_views.google_auth, name='api-google-auth'),
    path('api/google/oauth2callback/', api_views.google_oauth2callback, name='api-google-callback'),
    path('api/google/userinfo/', api_views.google_userinfo, name='api-google-userinfo'),
]
