from django.core.management.base import BaseCommand, CommandError

from Backend import services


class Command(BaseCommand):
    help = 'Create a user/account using the CreateUserAccount service (executes against real DB)'

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True)
        parser.add_argument('--first-name', default='')
        parser.add_argument('--last-name', default='')
        parser.add_argument('--username', required=True)
        parser.add_argument('--password', required=True)
        parser.add_argument('--status', type=int, default=0)

    def handle(self, *args, **options):
        email = options['email']
        first_name = options['first_name']
        last_name = options['last_name']
        username = options['username']
        password = options['password']
        status = options['status']

        res = services.create_user_account(
            email=email,
            first_name=first_name,
            last_name=last_name,
            username=username,
            password=password,
            status=status,
        )

        if res.get('success'):
            self.stdout.write(self.style.SUCCESS(f"OK: {res}"))
        else:
            self.stderr.write(self.style.ERROR(f"Error: {res}"))
            raise CommandError('CreateUserAccount failed')
