from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from django.shortcuts import get_object_or_404
from django.db.models import Case, When, Value, IntegerField
from django.db.models.functions import Cast

from .models import (
    VerifiedCompany,
    WorkFormat,
    JobType,
    Currency,
    AdministrativeUnit,
    Province,
    District,
    Ward,
    Form,
    PendingLookup,
)
from .serializers import (
    VerifiedCompanySerializer,
    WorkFormatSerializer,
    JobTypeSerializer,
    CurrencySerializer,
    AdministrativeUnitSerializer,
    ProvinceSerializer,
    DistrictSerializer,
    WardSerializer,
    FormSerializer,
)


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access if user is object owner (created_by) or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        return getattr(obj, 'created_by', None) == request.user


class LookupViewSetMixin:
    """Common behaviour for lookup viewsets: read for all, write for admins."""

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class VerifiedCompanyViewSet(LookupViewSetMixin, viewsets.ModelViewSet):
    serializer_class = VerifiedCompanySerializer

    def get_queryset(self):
        # Order by name, but 'other' always at the end
        return VerifiedCompany.objects.annotate(
            is_other=Case(
                When(code='other', then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )
        ).order_by('is_other', 'name')


class WorkFormatViewSet(LookupViewSetMixin, viewsets.ModelViewSet):
    serializer_class = WorkFormatSerializer

    def get_queryset(self):
        # Order by name, but 'other' always at the end
        return WorkFormat.objects.annotate(
            is_other=Case(
                When(code='other', then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )
        ).order_by('is_other', 'name')


class JobTypeViewSet(LookupViewSetMixin, viewsets.ModelViewSet):
    serializer_class = JobTypeSerializer

    def get_queryset(self):
        # Order by name, but 'other' always at the end
        return JobType.objects.annotate(
            is_other=Case(
                When(code='other', then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )
        ).order_by('is_other', 'name')


class CurrencyViewSet(LookupViewSetMixin, viewsets.ModelViewSet):
    serializer_class = CurrencySerializer

    def get_queryset(self):
        # Order by name, but 'other' always at the end
        return Currency.objects.annotate(
            is_other=Case(
                When(code='other', then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )
        ).order_by('is_other', 'name')


class AdministrativeUnitViewSet(LookupViewSetMixin, viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for administrative unit types."""
    queryset = AdministrativeUnit.objects.all()
    serializer_class = AdministrativeUnitSerializer


class ProvinceViewSet(LookupViewSetMixin, viewsets.ReadOnlyModelViewSet):
    """Tỉnh/Thành phố trực thuộc trung ương"""
    queryset = Province.objects.filter(is_active=True).select_related('administrative_unit').order_by('name')
    serializer_class = ProvinceSerializer

    @action(detail=True, methods=['get'])
    def districts(self, request, pk=None):
        """Get districts sorted: numeric names first (sorted numerically), then alphabetic names."""
        province = self.get_object()
        districts = District.objects.filter(province=province, is_active=True).select_related('administrative_unit')
        
        # Sort: numeric names first (by numeric value), then alphabetic names
        districts = districts.annotate(
            is_numeric=Case(
                When(name__regex=r'^\d+$', then=Value(0)),
                default=Value(1),
                output_field=IntegerField()
            ),
            numeric_value=Case(
                When(name__regex=r'^\d+$', then=Cast('name', IntegerField())),
                default=Value(999999),
                output_field=IntegerField()
            )
        ).order_by('is_numeric', 'numeric_value', 'name')
        
        serializer = DistrictSerializer(districts, many=True)
        return Response(serializer.data)


class DistrictViewSet(LookupViewSetMixin, viewsets.ReadOnlyModelViewSet):
    """Quận/Huyện/Thị xã/Thành phố thuộc tỉnh"""
    queryset = District.objects.filter(is_active=True).select_related('province', 'administrative_unit').order_by('code')
    serializer_class = DistrictSerializer

    @action(detail=True, methods=['get'])
    def wards(self, request, pk=None):
        """Get wards sorted: numeric names first (sorted numerically), then alphabetic names."""
        district = self.get_object()
        wards = Ward.objects.filter(district=district, is_active=True).select_related('administrative_unit')
        
        # Sort: numeric names first (by numeric value), then alphabetic names
        wards = wards.annotate(
            is_numeric=Case(
                When(name__regex=r'^\d+$', then=Value(0)),
                default=Value(1),
                output_field=IntegerField()
            ),
            numeric_value=Case(
                When(name__regex=r'^\d+$', then=Cast('name', IntegerField())),
                default=Value(999999),
                output_field=IntegerField()
            )
        ).order_by('is_numeric', 'numeric_value', 'name')
        
        serializer = WardSerializer(wards, many=True)
        return Response(serializer.data)


class WardViewSet(LookupViewSetMixin, viewsets.ReadOnlyModelViewSet):
    """Phường/Xã/Thị trấn"""
    queryset = Ward.objects.filter(is_active=True).select_related('district', 'administrative_unit').order_by('code')
    serializer_class = WardSerializer


class FormViewSet(viewsets.ModelViewSet):
    """List/create/update job forms.

    - List: public returns only active & published items; authenticated users also see their own.
    - Retrieve: public allowed for published items; owner/staff can access all.
    - Create: authenticated users only.
    - Update/Delete: owner or admin.
    """

    queryset = Form.objects.select_related('verified_company', 'work_format', 'job_type', 'salary_currency').all()
    serializer_class = FormSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        from django.db.models import Q
        qs = super().get_queryset()
        user = self.request.user
        
        # Staff can see all
        if user.is_authenticated and user.is_staff:
            return qs

        # Authenticated users see: approved jobs + their own jobs (any status)
        if user.is_authenticated:
            return qs.filter(
                Q(status='approved', is_active=True) | Q(created_by=user)
            )

        # Anonymous: only approved & active jobs
        return qs.filter(status='approved', is_active=True)

    def perform_create(self, serializer):
        # set created_by if available
        obj = serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
        # create PendingLookup entries for any other-texts provided
        self._create_pending_for_others(obj, serializer.validated_data)

    def perform_update(self, serializer):
        obj = serializer.save()
        self._create_pending_for_others(obj, serializer.validated_data)

    def _create_pending_for_others(self, form_obj, validated_data):
        # validated_data contains instances for SlugRelatedFields
        # create PendingLookup for any *_other fields where FK has code 'other'
        user = self.request.user if self.request.user.is_authenticated else None

        def maybe_create(lookup_type, fk_obj, other_value):
            if other_value and fk_obj is not None and getattr(fk_obj, 'code', '').lower() == 'other':
                # avoid duplicate proposals for same form+value
                exists = PendingLookup.objects.filter(lookup_type=lookup_type, proposed_value=other_value, form=form_obj).exists()
                if not exists:
                    PendingLookup.objects.create(
                        lookup_type=lookup_type,
                        proposed_value=other_value,
                        form=form_obj,
                        submitted_by=user,
                    )

        maybe_create('verifiedcompany', validated_data.get('verified_company'), validated_data.get('verified_company_other'))
        maybe_create('workformat', validated_data.get('work_format'), validated_data.get('work_format_other'))
        maybe_create('jobtype', validated_data.get('job_type'), validated_data.get('job_type_other'))
        maybe_create('currency', validated_data.get('salary_currency'), validated_data.get('salary_currency_other'))


class PendingLookupViewSet(viewsets.ReadOnlyModelViewSet):
    """Admins can list and review pending lookups via admin; expose read-only view for transparency."""

    queryset = PendingLookup.objects.all()
    permission_classes = [permissions.IsAdminUser]

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
