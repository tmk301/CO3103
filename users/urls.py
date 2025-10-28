from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .views import (
    RoleViewSet,
    GenderViewSet,
    StatusViewSet,
    RegisterUserView,
    MeUserView,
    ChangePasswordView,
    ProfileViewSet,
)

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'genders', GenderViewSet, basename='gender')
router.register(r'statuses', StatusViewSet, basename='status')
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegisterUserView.as_view(), name='register'),
    path('api/me/', MeUserView.as_view(), name='me'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
]