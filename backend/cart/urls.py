
from django.urls import path

from .views import (
    CartView,
    AddCartItemView,
    UpdateCartItemView,
    RemoveCartItemView,
)

urlpatterns = [
    path("", CartView.as_view(), name="cart"),
    path("add/", AddCartItemView.as_view(), name="cart-add"),
    path("update/", UpdateCartItemView.as_view(), name="cart-update"),
    path("remove/", RemoveCartItemView.as_view(), name="cart-remove"),
]
