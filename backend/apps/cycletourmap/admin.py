from django.contrib import admin
from django.apps import apps


class ModelAdmin(admin.ModelAdmin):
    def __init__(self, model, admin_site):
        self.list_display = [field.name for field in model._meta.fields]
        super().__init__(model, admin_site)


admin.site.register(apps.all_models["cycletourmap"].values(), ModelAdmin)
