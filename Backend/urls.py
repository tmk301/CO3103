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
from django.urls import path, include


# Lazy view loader to avoid importing heavy app modules at import-time
def _lazy_view(module_path: str, view_name: str):
    def _view(request, *args, **kwargs):
        module = __import__(module_path, fromlist=[view_name])
        view = getattr(module, view_name)
        return view(request, *args, **kwargs)
    return _view

urlpatterns = [
    path('admin/', admin.site.urls),
    # django-allauth endpoints (login, logout, social callbacks)
    path('accounts/', include('allauth.urls')),
    # RESTful API endpoints (lazy-loaded to avoid import-time DB/model dependencies)
    path('api/users/', _lazy_view('Backend.api_views', 'users_collection'), name='api-users'),
    path('api/sessions/', _lazy_view('Backend.api_views', 'login'), name='api-sessions'),
    path('api/users/password/', _lazy_view('Backend.api_views', 'change_password'), name='api-change-password'),
]
