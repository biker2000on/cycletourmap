from django import forms
from .models import Tour
from django.core.exceptions import ValidationError
from datetime import datetime

# from crispy_forms.helper import FormHelper
# from crispy_forms.layout import Submit, Layout, Fieldset
# from crispy_bootstrap5.bootstrap5 import FloatingField


class DateInput(forms.DateInput):
    input_type = "date"


class TourForm(forms.ModelForm):
    class Meta:
        model = Tour
        fields = (
            "id",
            "name",
            "description",
            "start_date",
            "end_date",
            "is_public",
        )

        widgets = {"id": forms.HiddenInput()}
