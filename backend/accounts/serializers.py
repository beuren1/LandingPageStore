
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from rest_framework import serializers


User = get_user_model()


# ==========================================
# SERIALIZER DE CADASTRO
# ==========================================

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "Este nome de usuário já está em uso."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Este e-mail já está cadastrado."
            )

        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as erro:
            raise serializers.ValidationError(erro.messages)

        return value


# ==========================================
# SERIALIZER DE VERIFICACAO DE E-MAIL
# ==========================================

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    code = serializers.RegexField(
        regex=r'^[0-9]{6}$',
        max_length=6,
        min_length=6
    )

    def validate_email(self, value):
        return value.strip().lower()




class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_email(self, value):
        return value.strip().lower()