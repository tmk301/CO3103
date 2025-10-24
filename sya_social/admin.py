from django.contrib import admin
from .models import SocialLink, OAuthToken


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ('id', 'provider', 'uid', 'email', 'user')
    search_fields = ('provider', 'uid', 'email')


@admin.register(OAuthToken)
class OAuthTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'link', 'expires_at')
    search_fields = ('link__uid',)
