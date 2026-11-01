
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import serializers, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer


class ProductInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)


class AddItemSerializer(ProductInputSerializer):
    quantity = serializers.IntegerField(
        min_value=1,
        max_value=100
    )


class UpdateItemSerializer(ProductInputSerializer):
    quantity = serializers.IntegerField(
        min_value=1,
        max_value=100
    )


class CartBaseView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def cart_response(self, user):
        cart = self.get_cart(user)
        cart = Cart.objects.prefetch_related(
            "items__product"
        ).get(pk=cart.pk)

        return Response(CartSerializer(cart).data)


class CartView(CartBaseView):
    def get(self, request):
        return self.cart_response(request.user)



class AddCartItemView(CartBaseView):
    def post(self, request):
        entrada = AddItemSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        product_id = entrada.validated_data["product_id"]
        quantity = entrada.validated_data["quantity"]

        with transaction.atomic():
            produto = get_object_or_404(
                Product,
                pk=product_id,
                active=True
            )

            carrinho = self.get_cart(request.user)

            item = CartItem.objects.select_for_update().filter(
                cart=carrinho,
                product=produto
            ).first()

            quantidade_atual = item.quantity if item else 0
            nova_quantidade = quantidade_atual + quantity

            if nova_quantidade > produto.stock:
                return Response(
                    {"error": "Estoque insuficiente."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if nova_quantidade > 100:
                return Response(
                    {"error": "Limite de 100 unidades por produto."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if item:
                item.quantity = nova_quantidade
                item.save(update_fields=["quantity"])
            else:
                CartItem.objects.create(
                    cart=carrinho,
                    product=produto,
                    quantity=nova_quantidade
                )

        return self.cart_response(request.user)



class UpdateCartItemView(CartBaseView):
    def patch(self, request):
        entrada = UpdateItemSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        product_id = entrada.validated_data["product_id"]
        quantity = entrada.validated_data["quantity"]

        with transaction.atomic():
            carrinho = self.get_cart(request.user)

            item = get_object_or_404(
                CartItem.objects.select_related("product"),
                cart=carrinho,
                product_id=product_id
            )

            if quantity > item.product.stock:
                return Response(
                    {"error": "Estoque insuficiente."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            item.quantity = quantity
            item.save(update_fields=["quantity"])

        return self.cart_response(request.user)


class RemoveCartItemView(CartBaseView):
    def delete(self, request):
        entrada = ProductInputSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        carrinho = self.get_cart(request.user)

        removidos, _ = CartItem.objects.filter(
            cart=carrinho,
            product_id=entrada.validated_data["product_id"]
        ).delete()

        if not removidos:
            return Response(
                {"error": "Produto não encontrado no carrinho."},
                status=status.HTTP_404_NOT_FOUND
            )

        return self.cart_response(request.user)
