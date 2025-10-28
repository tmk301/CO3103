from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth.models import update_last_login

from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction, IntegrityError

from .models import Profile, Role, Gender, Status, CustomUser
from .serializers import (
    ProfileSerializer,
    RoleSerializer,
    GenderSerializer,
    StatusSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserSelfUpdateSerializer,
    PasswordChangeSerializer,
)

# Custom Permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        return obj.user == request.user

# Lookup ViewSets

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

# Registration

class RegisterUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                user = serializer.save()
        except IntegrityError:
            return Response({"detail": "User with provided details already exists.", "hint": "Try a different username or email."}, status=status.HTTP_400_BAD_REQUEST)
        out = UserSerializer(user, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)

# User ViewSet

class MeUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)
    
    def patch(self, request):
        serializer = UserSelfUpdateSerializer(instance=request.user, data=request.data, partial=True, context={'request': request})
        
        try:
            serializer.is_valid(raise_exception=True)
            with transaction.atomic():
                serializer.save()
        except IntegrityError:
            return Response({"detail": "Update failed due to integrity error."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(UserSerializer(request.user, context={'request': request}).data)

# Change Password View

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)

# Profile ViewSet

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.select_related('user', 'user__role', 'user__status', 'gender')
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    authentication_classes = [JWTAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user__role__code', 'user__status__code', 'gender__code']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['dob', 'user__date_joined']
    ordering = ['user__date_joined']

    def get_queryset(self):
        qs = super().get_queryset()
        return qs if self.request.user.is_staff else qs.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me', permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            try:
                profile = Profile.objects.get(user=request.user)
            except Profile.DoesNotExist:
                return Response({"detail": "Profile does not exist."}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        partial = request.method == 'PATCH'
        try:
            with transaction.atomic():
                profile, created = Profile.objects.get_or_create(user=request.user)
                serializer = self.get_serializer(profile if not created else None, data=request.data, partial=partial)
                serializer.is_valid(raise_exception=True)
                instance = serializer.save(user=request.user) if created else serializer.save()
        except IntegrityError:
            return Response({"detail": "Update failed due to integrity error."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.get_serializer(instance if 'instance' in locals() else profile).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# Custom SimpleJWT token view to update last_login when a token is issued.
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        try:
            # Update last_login for the authenticated user
            update_last_login(None, self.user)
        except Exception:
            # Do not fail authentication if updating last_login fails
            pass
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer