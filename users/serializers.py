from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Profile, Role, Gender, Status

User = get_user_model()

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

class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    # role/status live on the related User model; expose them via source
    role = RoleSerializer(source='user.role', read_only=True)
    gender = GenderSerializer()
    status = StatusSerializer(source='user.status', read_only=True)

    class Meta:
        model = Profile
        fields = ['user', 'role', 'dob', 'gender', 'bio', 'status']

class RegisterProfileSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, allow_blank=False, required=True)
    last_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    email = serializers.EmailField(allow_blank=False, required=True)
    phone = serializers.CharField(max_length=15, allow_blank=True, required=False)
    role_code = serializers.SlugRelatedField(slug_field='code', queryset=Role.objects.all())
    gender_code = serializers.SlugRelatedField(slug_field='code', queryset=Gender.objects.all())
    dob = serializers.DateField(required=False)
    bio = serializers.CharField(allow_blank=True, required=False)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def create(self, validated_data):
        # Extract fields
        password = validated_data.pop('password')
        username = validated_data.pop('username')
        email = validated_data.pop('email', None)
        phone = validated_data.pop('phone', None)
        role_inst = validated_data.pop('role_code', None)  # Role instance or None
        gender_inst = validated_data.pop('gender_code', None)  # Gender instance or None
        dob = validated_data.pop('dob', None)
        bio = validated_data.pop('bio', None)

        from django.db import IntegrityError, transaction
        try:
            with transaction.atomic():
                # create user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=validated_data.get('first_name', ''),
                    last_name=validated_data.get('last_name', ''),
                )

                # assign role/status on user if provided
                save_fields = []
                if role_inst is not None:
                    user.role = role_inst
                    save_fields.append('role')

                # Save phone on the user model (Profile has no phone field)
                if phone is not None:
                    user.phone = phone
                    save_fields.append('phone')

                # If Status should be set via serializer in future, handle here similarly
                if save_fields:
                    user.save(update_fields=save_fields)

                # create profile with profile-specific fields
                profile_kwargs = {'user': user}
                # phone is stored on User, not Profile
                if gender_inst is not None:
                    profile_kwargs['gender'] = gender_inst
                if dob is not None:
                    profile_kwargs['dob'] = dob
                if bio is not None:
                    profile_kwargs['bio'] = bio

                profile = Profile.objects.create(**profile_kwargs)

        except IntegrityError:
            raise serializers.ValidationError("Failed to create profile due to integrity error.")

        return profile