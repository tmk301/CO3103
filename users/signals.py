from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver
from django.apps import apps

@receiver(post_save)
def create_profile_for_user(sender, instance, created, **kwargs):
    """Create a Profile automatically when a CustomUser is created."""
    # Resolve the CustomUser model at runtime
    UserModel = apps.get_model('users', 'CustomUser')
    if sender is not UserModel:
        return
    if not created:
        return
    Profile = apps.get_model('users', 'Profile')
    # Idempotent: create only if not exists
    Profile.objects.get_or_create(user=instance)
