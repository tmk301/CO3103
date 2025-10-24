from django.apps import AppConfig


class SyaSocialConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sya_social'
    verbose_name = 'SYA Social Links'

    def ready(self):
        # import signal handlers so they are registered when the app is ready
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass
