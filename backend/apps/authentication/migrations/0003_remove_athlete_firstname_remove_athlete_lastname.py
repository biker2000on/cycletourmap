# Generated by Django 4.1 on 2022-09-16 00:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0002_alter_athlete_id"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="athlete",
            name="firstname",
        ),
        migrations.RemoveField(
            model_name="athlete",
            name="lastname",
        ),
    ]
