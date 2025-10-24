from allauth.account.signals import user_logged_in
from django.dispatch import receiver
from django.conf import settings
from Backend.models import AuthUser, AuthAccount


@receiver(user_logged_in)
def handle_allauth_user_logged_in(request, user, **kwargs):
    """When django-allauth logs a user in, attempt to map to the project's AuthUser
    (by email) and persist our `user_id` in the session so API endpoints recognize it.
    """
    try:
        email = getattr(user, 'email', None)
        if not email:
            return
        auth_user = AuthUser.objects.filter(email=email, is_deleted=False).first()
        if not auth_user:
            # no matching internal user
            return
        # set our session key so api_views.session_info can pick it up immediately
        try:
            request.session['user_id'] = getattr(auth_user, 'user_id', None) or getattr(auth_user, 'id', None)
            print(f"[sya_social.signals] mapped allauth user {email} -> user_id={request.session.get('user_id')}")
        except Exception:
            # best-effort; don't crash login
            print("[sya_social.signals] failed to persist user_id in session")
    except Exception as e:
        print("[sya_social.signals] unexpected error:", e)
