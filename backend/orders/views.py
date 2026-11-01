
from decimal import Decimal

from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart, CartItem
from products.models import Product
from .models import Order, OrderItem
from .serializers import CheckoutSerializer, OrderSerializer


class CheckoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            cart = get_object_or_404(
                Cart,
                user=request.user
            )

            items = list(
                CartItem.objects.filter(cart=cart)
                .select_related("product")
                .order_by("product_id")
            )

            if not items:
                return Response(
                    {"error": "Seu carrinho está vazio."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verifica disponibilidade antes de criar o pedido.
            for item in items:
                product = item.product

                if (
                    not product.active
                    or item.quantity < 1
                    or item.quantity > 100
                    or item.quantity > product.stock
                ):
                    return Response(
                        {
                            "error": (
                                f"Produto indisponível ou estoque "
                                f"insuficiente: {product.name}"
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

            order = Order.objects.create(
                user=request.user,
                **serializer.validated_data
            )

            total = Decimal("0.00")

            for item in items:
                product = item.product
                unit_price = product.price
                subtotal = unit_price * item.quantity

                # Reduz o estoque somente se ainda for suficiente.
                updated = Product.objects.filter(
                    pk=product.pk,
                    active=True,
                    stock__gte=item.quantity
                ).update(
                    stock=F("stock") - item.quantity
                )

                if updated != 1:
                    # Uma exceção força rollback da transação.
                    raise RuntimeError(
                        "O estoque mudou durante o checkout."
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    unit_price=unit_price,
                    quantity=item.quantity
                )

                total += subtotal

            order.total = total
            order.save(update_fields=["total"])

            CartItem.objects.filter(cart=cart).delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class MyOrdersView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = (
            Order.objects.filter(user=request.user)
            .prefetch_related("items")
            .order_by("-created_at")
        )

        return Response(
            OrderSerializer(orders, many=True).data
        )
    