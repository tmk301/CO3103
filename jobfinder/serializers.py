from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator

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
)

User = get_user_model()

# Lookup Serializers

class VerifiedCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = VerifiedCompany
        fields = ['code', 'name', 'website', 'description', 'is_active']

class WorkFormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkFormat
        fields = ['code', 'name', 'description', 'is_active']

class JobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobType
        fields = ['code', 'name', 'description', 'is_active']
    
class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['code', 'name', 'symbol', 'is_active']

# Location Serializers

class AdministrativeUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdministrativeUnit
        fields = ['id', 'full_name', 'english_full_name', 'short_name', 'english_short_name']


class ProvinceSerializer(serializers.ModelSerializer):
    administrative_unit_name = serializers.CharField(source='administrative_unit.short_name', read_only=True)

    class Meta:
        model = Province
        fields = ['id', 'code', 'name', 'english_name', 'full_name', 'english_full_name', 'administrative_unit', 'administrative_unit_name', 'is_active']


class DistrictSerializer(serializers.ModelSerializer):
    province_name = serializers.CharField(source='province.name', read_only=True)
    administrative_unit_name = serializers.CharField(source='administrative_unit.short_name', read_only=True)

    class Meta:
        model = District
        fields = ['id', 'code', 'name', 'english_name', 'full_name', 'english_full_name', 'province', 'province_name', 'administrative_unit', 'administrative_unit_name', 'is_active']

class WardSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    administrative_unit_name = serializers.CharField(source='administrative_unit.short_name', read_only=True)

    class Meta:
        model = Ward
        fields = ['id', 'code', 'name', 'english_name', 'full_name', 'english_full_name', 'district', 'district_name', 'administrative_unit', 'administrative_unit_name', 'is_active']

# Form Serializers

class FormSerializer(serializers.ModelSerializer):
    verified_company = serializers.SlugRelatedField(slug_field='code', queryset=VerifiedCompany.objects.all())
    created_by = serializers.SlugRelatedField(slug_field='username', read_only=True)
    work_format = serializers.SlugRelatedField(slug_field='code', queryset=WorkFormat.objects.all(), allow_null=True, required=False)
    job_type = serializers.SlugRelatedField(slug_field='code', queryset=JobType.objects.all(), allow_null=True, required=False)
    salary_currency = serializers.SlugRelatedField(slug_field='code', queryset=Currency.objects.all(), allow_null=True, required=False)

    # Location fields - accept ULID string IDs from frontend
    province = serializers.PrimaryKeyRelatedField(queryset=Province.objects.all(), allow_null=True, required=False)
    district = serializers.PrimaryKeyRelatedField(queryset=District.objects.all(), allow_null=True, required=False)
    ward = serializers.PrimaryKeyRelatedField(queryset=Ward.objects.all(), allow_null=True, required=False)

    # Read-only location names for display
    province_name = serializers.CharField(source='province.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    ward_name = serializers.CharField(source='ward.name', read_only=True)

    # Read-only display fields (handles 'other' case automatically)
    display_verified_company = serializers.CharField(read_only=True)
    display_work_format = serializers.CharField(read_only=True)
    display_job_type = serializers.CharField(read_only=True)
    display_salary_currency = serializers.CharField(read_only=True)
    salary_currency_symbol = serializers.CharField(source='salary_currency.symbol', read_only=True)

    # Allow other-text fields
    work_format_other = serializers.CharField(allow_blank=True, required=False)
    job_type_other = serializers.CharField(allow_blank=True, required=False)
    verified_company_other = serializers.CharField(allow_blank=True, required=False)
    salary_currency_other = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Form
        fields = [
            'id',
            'verified_company',
            'verified_company_other',
            'display_verified_company',
            'created_by',
            'title',
            'contact_email',
            'application_email',
            'application_url',
            'work_format',
            'work_format_other',
            'display_work_format',
            'job_type',
            'job_type_other',
            'display_job_type',
            'salary_from',
            'salary_to',
            'salary_currency',
            'salary_currency_other',
            'display_salary_currency',
            'salary_currency_symbol',
            'province',
            'province_name',
            'district',
            'district_name',
            'ward',
            'ward_name',
            'address',
            'number_of_positions',
            'description',
            'responsibilities',
            'requirements',
            'required_experience',
            'benefits',
            'status',
            'is_active',
            'created_at',
            'updated_at',
            'expires_at',
        ]
        read_only_fields = ['status']

    def validate(self, data):
        errors = {}

        def is_other(obj):
            return obj is not None and getattr(obj, 'code', '').lower() == 'other'

        # For writes, SlugRelatedField will give model instances in .validated_data if queryset provided
        verified_company = data.get('verified_company')
        work_format = data.get('work_format')
        job_type = data.get('job_type')
        salary_currency = data.get('salary_currency')

        if is_other(verified_company) and not data.get('verified_company_other'):
            errors['verified_company_other'] = 'Provide company name when "Other" is selected.'
        if is_other(work_format) and not data.get('work_format_other'):
            errors['work_format_other'] = 'Provide a custom work format when "Other" is selected.'
        if is_other(job_type) and not data.get('job_type_other'):
            errors['job_type_other'] = 'Provide a custom job type when "Other" is selected.'
        if salary_currency and getattr(salary_currency, 'code', '').lower() == 'other' and not data.get('salary_currency_other'):
            errors['salary_currency_other'] = 'Provide currency text when "Other" is selected.'

        # Validate salary range
        salary_from = data.get('salary_from')
        salary_to = data.get('salary_to')
        if salary_from is not None and salary_to is not None:
            if salary_from >= salary_to:
                errors['salary_from'] = 'Minimum salary must be less than maximum salary.'

        if errors:
            raise serializers.ValidationError(errors)

        return data