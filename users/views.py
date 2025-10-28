from time import timezone
from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView

from django_filters.rest_framework import DjangoFilterBackend

from .models import Profile, Role, Gender, Status
from .serializers import ProfileSerializer, RegisterProfileSerializer, RoleSerializer, GenderSerializer, StatusSerializer

class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all().order_by('code')
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class GenderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Gender.objects.all().order_by('code')
    serializer_class = GenderSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class StatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Status.objects.all().order_by('code')
    serializer_class = StatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        return obj.user == request.user

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.select_related('user__role', 'user__status', 'user', 'gender').all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    authentication_classes = [JWTAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user__role__code', 'user__status__code', 'gender__code']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']
    ordering_fields = ['dob']

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin], url_path='me')
    def me(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        elif request.method in ['PUT', 'PATCH']:
            serializer = RegisterProfileSerializer(data=request.data, partial=(request.method == 'PATCH'))
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data

            user = request.user
            user_changed = False
            for fld in ('first_name', 'last_name', 'email', 'phone'):
                if fld in data:
                    setattr(user, fld, data.get(fld))
                    user_changed = True

            if 'role_code' in data and data.get('role_code') is not None:
                user.role = data.get('role_code')
                user_changed = True

            if 'status_code' in data and data.get('status_code') is not None:
                user.status = data.get('status_code')
                user_changed = True

            if user_changed:
                user.last_login = timezone.now()
                user.save()

            profile_changed = False
            if 'gender_code' in data:
                profile.gender = data.get('gender_code')
                profile_changed = True
            if 'dob' in data:
                profile.dob = data.get('dob')
                profile_changed = True
            if 'bio' in data:
                profile.bio = data.get('bio')
                profile_changed = True

            if profile_changed:
                profile.save()

            return Response(self.get_serializer(profile).data)