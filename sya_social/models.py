from django.db import models


class SocialLink(models.Model):
    """Links a SYA user (AuthUser) to an external social provider account."""
    id = models.BigAutoField(primary_key=True)
    # AuthUser is an unmanaged model in this project (external schema). To avoid
    # creating a database-level foreign key constraint (which can fail when the
    # target table is in a different schema or is unmanaged), set db_constraint=False
    # so Django treats this as a logical relation without emitting a FK in SQL.
    user = models.ForeignKey('Backend.AuthUser', on_delete=models.DO_NOTHING, db_column='user_id', db_constraint=False)
    provider = models.CharField(max_length=50)
    uid = models.CharField(max_length=255)
    email = models.CharField(max_length=255, null=True)
    extra_data = models.JSONField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sya_social_link'
        unique_together = (('provider', 'uid'),)

    def __str__(self):
        return f"{self.provider}:{self.uid} -> user_id={self.user_id}"


class OAuthToken(models.Model):
    """Optional storage for tokens associated with a SocialLink."""
    id = models.BigAutoField(primary_key=True)
    link = models.ForeignKey(SocialLink, on_delete=models.CASCADE, related_name='tokens')
    access_token = models.TextField(null=True)
    refresh_token = models.TextField(null=True)
    expires_at = models.DateTimeField(null=True)
    scope = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sya_oauth_token'

    def __str__(self):
        return f"token for {self.link_id}"
