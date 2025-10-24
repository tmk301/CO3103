from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='OAuthToken',
            fields=[
                ('token_id', models.AutoField(primary_key=True, serialize=False, db_column='token_id')),
                ('provider', models.CharField(max_length=64)),
                ('access_token', models.TextField(null=True)),
                ('refresh_token', models.TextField(null=True)),
                ('scope', models.TextField(null=True)),
                ('expires_at', models.DateTimeField(null=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField()),
                ('updated_at', models.DateTimeField(null=True)),
                ('user', models.ForeignKey(db_column='user_id', on_delete=django.db.models.deletion.CASCADE, to='Backend.AuthUser')),
            ],
            options={'db_table': 'auth.oauth_token'},
        ),
    ]
