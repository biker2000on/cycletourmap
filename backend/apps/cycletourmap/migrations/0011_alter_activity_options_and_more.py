# Generated by Django 4.1 on 2023-02-02 01:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("cycletourmap", "0010_activity_detail"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="activity",
            options={"ordering": ["start_date"]},
        ),
        migrations.AddField(
            model_name="activity_detail",
            name="fit_file_detail",
            field=models.BooleanField(
                default=False,
                help_text="This is to denote direct parsing of FIT/activity files",
            ),
        ),
        migrations.AddField(
            model_name="activity_detail",
            name="strava_detail",
            field=models.BooleanField(
                default=True,
                help_text="This is to denote the values came from the Strava Streamset API",
            ),
        ),
        migrations.AlterField(
            model_name="activity",
            name="average_speed",
            field=models.FloatField(blank=True, null=True),
        ),
    ]
