from django.contrib import admin
from .models import EmailVerification


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'verified',
        'created_at',
        'expires_at',
        'attempts',
    )

    list_filter = (
        'verified',
    )

    search_fields = (
        'user__username',
        'user__email',
    )

    readonly_fields = (
        'code_hash',
        'created_at',
    )