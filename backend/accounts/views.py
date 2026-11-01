
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer, LoginSerializer


User = get_user_model()


# ==========================================
# CADASTRO DE USUARIOS
# SEM VERIFICACAO DE E-MAIL
# ==========================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        dados = serializer.validated_data

        with transaction.atomic():
            usuario = User.objects.create_user(
                username=dados["username"],
                email=dados["email"],
                password=dados["password"],
                is_active=True
            )

        return Response(
            {
                "message": "Conta criada com sucesso!",
                "user": {
                    "id": usuario.id,
                    "username": usuario.username,
                    "email": usuario.email
                }
            },
            status=status.HTTP_201_CREATED
        )


# ==========================================
# LOGIN DE USUARIOS
# ==========================================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        usuario = User.objects.filter(
            email__iexact=email
        ).first()

        if usuario is None:
            return Response(
                {"error": "E-mail ou senha incorretos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario_autenticado = authenticate(
            request,
            username=usuario.get_username(),
            password=password
        )

        if usuario_autenticado is None:
            return Response(
                {"error": "E-mail ou senha incorretos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        token, created = Token.objects.get_or_create(
            user=usuario_autenticado
        )

        return Response(
            {
                "message": "Login realizado com sucesso!",
                "token": token.key,
                "user": {
                    "id": usuario_autenticado.id,
                    "username": usuario_autenticado.username,
                    "email": usuario_autenticado.email
                }
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# USUARIO AUTENTICADO
# ==========================================

class MeView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user

        return Response({
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email
        })


# ==========================================
# LOGOUT
# ==========================================

class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(
            key=request.auth.key
        ).delete()

        return Response(
            {
                "message": "Logout realizado com sucesso."
            },
            status=status.HTTP_200_OK
        )
