
from django.db import models
from django.conf import settings
from products.models import Product


# ==========================================
# PEDIDOS DA BEUREN STORE
# ==========================================

class Order(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pendente"),
        ("paid", "Pago"),
        ("shipped", "Enviado"),
        ("delivered", "Entregue"),
        ("cancelled", "Cancelado"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="store_orders"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    # Endereco de entrega
    recipient_name = models.CharField(max_length=150)
    zip_code = models.CharField(max_length=9)
    street = models.CharField(max_length=200)
    number = models.CharField(max_length=20)
    complement = models.CharField(
        max_length=150,
        blank=True
    )
    neighborhood = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)

    # Total registrado no momento do pedido
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Pedido #{self.id} - {self.user.username}"


# ==========================================
# ITENS DO PEDIDO
# ==========================================

class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )

    # Guarda o nome e preco no momento da compra
    product_name = models.CharField(max_length=200)

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    quantity = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gte=1),
                name="order_item_quantity_positive"
            )
        ]

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"
