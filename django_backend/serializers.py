from rest_framework import serializers
from .models import Payment
from products.models import Product
from orders.models import Order

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        # Assuming a basic Product model
        model = Product
        fields = ['id', 'name', 'category', 'price', 'description', 'image_url', 'stock', 'vendor', 'is_active']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'phone_number', 'status', 'mpesa_receipt_number', 'created_at']
        read_only_fields = ['status', 'mpesa_receipt_number', 'created_at']

class STKPushRequestSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15, help_text="User's M-Pesa phone number")
    order_id = serializers.IntegerField(help_text="ID of the order to pay for")
