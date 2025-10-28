from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver
from django.apps import apps
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import update_last_login
from django.utils import timezone

@receiver(user_logged_in)
def handle_user_logged_in(sender, user, request, **kwargs):
    """Ensure user's last_login is updated on successful login.

    We delegate to Django's update_last_login helper which handles
    backend-specific behavior; as a fallback we set the field manually.
    """
    try:
        # Prefer built-in helper which also sends signals if needed
        update_last_login(None, user)
    except Exception:
        # Fallback: set timestamp directly (useful in unusual setups)
        try:
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
        except Exception:
            # Avoid raising during login; just skip if update fails
            pass
