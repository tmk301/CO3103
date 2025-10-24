from django.core.management.base import BaseCommand
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Create or update the Google SocialApp (django-allauth) from environment variables.'

    def handle(self, *args, **options):
        try:
            from allauth.socialaccount.models import SocialApp
            from django.contrib.sites.models import Site
        except Exception as exc:
            self.stderr.write(self.style.ERROR('allauth or sites framework not available: %s' % exc))
            return

        client_id = os.environ.get('GOOGLE_CLIENT_ID')
        secret = os.environ.get('GOOGLE_CLIENT_SECRET')
        name = os.environ.get('GOOGLE_APP_NAME', 'Google')
        provider = 'google'

        if not client_id or not secret:
            self.stderr.write(self.style.ERROR('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment'))
            return

        site_id = getattr(settings, 'SITE_ID', 1)
        site, _ = Site.objects.get_or_create(id=site_id, defaults={'domain': os.environ.get('GOOGLE_SITE_DOMAIN', 'localhost'), 'name': os.environ.get('GOOGLE_SITE_NAME', 'localhost')})

        app, created = SocialApp.objects.get_or_create(provider=provider, name=name, defaults={'client_id': client_id, 'secret': secret})
        if not created:
            app.client_id = client_id
            app.secret = secret
            app.save()

        if site not in app.sites.all():
            app.sites.add(site)

        self.stdout.write(self.style.SUCCESS(f"SocialApp for provider='{provider}' is present (id={app.id}). Associated with site id={site.id}.") )
