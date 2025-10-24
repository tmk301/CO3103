# Auto-generated cleaned models — review before use
from django.db import models

class AuthUser(models.Model):
    user_id = models.AutoField(primary_key=True, db_column='user_id')
    email = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100, null=True)
    last_name = models.CharField(max_length=100, null=True)
    status = models.TextField()
    is_deleted = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = 'auth.user'


class OAuthToken(models.Model):
    """Store OAuth tokens for external providers per user.

    This model is managed by Django and will require migrations to create the
    corresponding table. Fields are intentionally generic so other providers
    can be stored in the same table if needed.
    """
    token_id = models.AutoField(primary_key=True, db_column='token_id')
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    provider = models.CharField(max_length=64)
    access_token = models.TextField(null=True)
    refresh_token = models.TextField(null=True)
    scope = models.TextField(null=True)
    expires_at = models.DateTimeField(null=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

    class Meta:
        managed = True
        db_table = 'auth.oauth_token'

class AuthRole(models.Model):
    role_id = models.AutoField(primary_key=True, db_column='role_id')
    role_name = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = 'auth.role'

class AuthUserRole(models.Model):
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    role = models.ForeignKey('AuthRole', models.CASCADE, db_column='role_id')
    granted_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth.user_role'
        unique_together = (('user', 'role'),)

class AuthAccount(models.Model):
    account_id = models.AutoField(primary_key=True, db_column='account_id')
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    username = models.CharField(max_length=128)
    password_hash = models.CharField(max_length=512)
    is_deleted = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = 'auth.account'

class NotifyNotification(models.Model):
    notification_id = models.AutoField(primary_key=True, db_column='notification_id')
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    subject = models.CharField(max_length=255, null=True)
    content = models.TextField(null=True)
    sender = models.CharField(max_length=255, null=True)
    received_at = models.DateTimeField()
    status = models.TextField()
    label = models.TextField(null=True)
    is_deleted = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = 'notify.notification'

class NotifyFilterRule(models.Model):
    filter_id = models.AutoField(primary_key=True, db_column='filter_id')
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    type = models.TextField()
    domain = models.CharField(max_length=255, null=True)
    keyword = models.CharField(max_length=255, null=True)
    is_deleted = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = 'notify.filter_rule'

class NotifyPushNotification(models.Model):
    push_id = models.AutoField(primary_key=True, db_column='push_id')
    notification = models.ForeignKey('NotifyNotification', models.CASCADE, db_column='notification_id')
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    sent_at = models.DateTimeField()
    status = models.TextField()
    is_deleted = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = 'notify.push_notification'

class TaskTaskGroup(models.Model):
    group_id = models.AutoField(primary_key=True, db_column='group_id')
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    name = models.CharField(max_length=255)
    description = models.TextField(null=True)
    is_deleted = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = 'task.task_group'

class TaskTaskMail(models.Model):
    taskmail_id = models.AutoField(primary_key=True, db_column='taskmail_id')
    group = models.ForeignKey('TaskTaskGroup', models.CASCADE, db_column='group_id')
    notification = models.ForeignKey('NotifyNotification', models.CASCADE, db_column='notification_id')
    is_deleted = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = 'task.task_mail'

# Below are some default Django auth and admin models for completeness

class DjangoAdminLog(models.Model):
    id = models.AutoField(primary_key=True)
    action_time = models.DateTimeField()
    object_id = models.TextField(null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.IntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.CASCADE, db_column='content_type_id')
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')

    class Meta:
        managed = False
        db_table = 'django_admin_log'

class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40, db_column='session_key')
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'

class DjangoContentType(models.Model):
    id = models.AutoField(primary_key=True)
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'

class AuthPermission(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.CASCADE, db_column='content_type_id')
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'

class AuthGroup(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'

class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey('AuthGroup', models.CASCADE, db_column='group_id')
    permission = models.ForeignKey('AuthPermission', models.CASCADE, db_column='permission_id')

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'

class AuthUserDjango(models.Model):
    id = models.AutoField(primary_key=True)
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'

class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    group = models.ForeignKey('AuthGroup', models.CASCADE, db_column='group_id')

    class Meta:
        managed = False
        db_table = 'auth_user_groups'

class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey('AuthUser', models.CASCADE, db_column='user_id')
    permission = models.ForeignKey('AuthPermission', models.CASCADE, db_column='permission_id')

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
