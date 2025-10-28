from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model

from .models import Profile, Role, Gender, Status, CustomUser, CustomUserManager

User = get_user_model()

# Lookup Serializers

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['code', 'name', 'description', 'is_active']

class GenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gender
        fields = ['code', 'name', 'is_active']

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['code', 'name', 'description', 'is_active']

# Profile Serializers

class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    gender = serializers.SlugRelatedField(slug_field='code', queryset=Gender.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Profile
        fields = ['user', 'dob', 'gender', 'bio']

# User Serializers

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SlugRelatedField(slug_field='code', queryset=Role.objects.all(), allow_null=True, required=False)
    status = serializers.SlugRelatedField(slug_field='code', queryset=Status.objects.all(), allow_null=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'phone', 'first_name', 'last_name', 'role', 'status', 'is_active', 'is_staff', 'date_joined']
        read_only_fields = ['username', 'is_active', 'is_staff', 'date_joined']

class UserCreateSerializer(serializers.Serializer):
    """Create a CustomUser (used by registration)."""
    username = serializers.CharField(
        max_length=150,
           validators=[UniqueValidator(queryset=User.objects.all(), lookup='iexact')],
    )
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    email = serializers.EmailField(
        required=True,
           validators=[UniqueValidator(queryset=User.objects.all(), lookup='iexact')],
    )
    phone = serializers.CharField(max_length=15, allow_blank=True, required=False)
    role_code = serializers.SlugRelatedField(slug_field='code', queryset=Role.objects.all())
    status_code = serializers.SlugRelatedField(slug_field='code', queryset=Status.objects.all())

    def validate_username(self, value: str):
        v = value.strip()
        if User.objects.filter(username__iexact=v).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value: str):
        v = value.strip()
        if User.objects.filter(email__iexact=v).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        username = validated_data.pop('username')
        email = validated_data.pop('email', None)
        phone = validated_data.pop('phone', None)
        role_inst = validated_data.pop('role_code', None)
        status_inst = validated_data.pop('status_code', None)

        user = User.objects.create_user(
            username=username,
            email=email,
            phone=phone,
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        save_fields = []
        if role_inst is not None:
            user.role = role_inst
            save_fields.append('role')
        if status_inst is not None:
            user.status = status_inst
            save_fields.append('status')
        if save_fields:
            user.save(update_fields=save_fields)

        try:
            Profile.objects.get_or_create(user=user)
        except Exception:
            pass

        return user
    
class UserSelfUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=15, required=False)

    def validate_email(self, value: str):
        user = self.context['request'].user
        v = value.strip()
        if User.objects.filter(email__iexact=v).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def update(self, instance, validated_data):
        for fld in ('first_name', 'last_name', 'email', 'phone'):
            if fld in validated_data:
                setattr(instance, fld, validated_data.get(fld))
        instance.save(update_fields=[fld for fld in ('first_name', 'last_name', 'email', 'phone') if fld in validated_data])
        return instance
    
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs.get('old_password')):
            raise serializers.ValidationError("Old password is incorrect.")
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user