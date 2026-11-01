from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class EmailVerification(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='email_verification'
    )

    code_hash = models.CharField(
        max_length=128
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    expires_at = models.DateTimeField()

    verified = models.BooleanField(
        default=False
    )

    attempts = models.PositiveIntegerField(
        default=0
    )

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f'Verificação de {self.user.username}'