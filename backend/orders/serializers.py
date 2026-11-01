
from rest_framework import serializers

from .models import Order, OrderItem


class CheckoutSerializer(serializers.Serializer):
    recipient_name = serializers.CharField(max_length=150)
    zip_code = serializers.RegexField(
        regex=r"^\d{5}-?\d{3}$"
    )
    street = serializers.CharField(max_length=200)
    number = serializers.CharField(max_length=20)
    complement = serializers.CharField(
        max_length=150,
        allow_blank=True,
        required=False,
        default=""
    )
    neighborhood = serializers.CharField(max_length=100)
    city = serializers.CharField(max_length=100)
    state = serializers.RegexField(
        regex=r"^[A-Za-z]{2}$"
    )

    def validate_state(self, value):
        return value.upper()


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "unit_price",
            "quantity",
            "subtotal",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "total",
            "created_at",
            "recipient_name",
            "zip_code",
            "street",
            "number",
            "complement",
            "neighborhood",
            "city",
            "state",
            "items",
        ]
