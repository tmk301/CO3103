from django.urls import path
from . import views

urlpatterns = [
    path('link/', views.link_social, name='sya-social-link'),
    path('unlink/', views.unlink_social, name='sya-social-unlink'),
    path('lookup/', views.lookup_social, name='sya-social-lookup'),
]
