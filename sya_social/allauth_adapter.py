from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from django.shortcuts import redirect
from django.conf import settings


class SYASocialAdapter(DefaultSocialAccountAdapter):
    """Custom allauth adapter that prevents automatic login/signup via social
    providers. Instead, after successful social auth we redirect the user back
    to the frontend with provider/uid/email in query params so the frontend
    can call the SYA linking API.

    This ensures Google is used only for linking (getting email/permissions),
    not for authenticating the user in SYA.
    """

    def pre_social_login(self, request, sociallogin):
        # This is called after the social provider returns data, but before
        # the login/signup flow completes.
        try:
            account = sociallogin.account
            provider = getattr(account, 'provider', '')
            uid = getattr(account, 'uid', '')
            extra = getattr(account, 'extra_data', {}) or {}

            # try to get an email from the social data (may be in extra_data or sociallogin.user)
            email = ''
            if extra.get('email'):
                email = extra.get('email')
            else:
                email = getattr(sociallogin.user, 'email', '') or ''

            # Build frontend redirect URL
            frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            # Encode values as simple query params (URL-escaped by redirect)
            redirect_url = f"{frontend}?social_provider={provider}&social_uid={uid}&social_email={email}"

            # Stop allauth's default handling (no local login or user creation)
            raise ImmediateHttpResponse(redirect(redirect_url))
        except ImmediateHttpResponse:
            raise
        except Exception:
            # On error, fail-safe to normal behavior
            return super().pre_social_login(request, sociallogin)
