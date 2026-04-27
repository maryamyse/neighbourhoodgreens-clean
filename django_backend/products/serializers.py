from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.shop_name')
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = [
            'id', 'vendor', 'vendor_name', 'name', 'description', 
            'category', 'category_name', 'price', 'stock_quantity', 
            'image', 'availability_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['vendor', 'created_at', 'updated_at', 'availability_status']

    def validate(self, attrs):
        if attrs.get('price', 0) < 0:
            raise serializers.ValidationError({"price": "Price cannot be negative."})
        if attrs.get('stock_quantity', 0) < 0:
            raise serializers.ValidationError({"stock_quantity": "Stock quantity cannot be negative."})
        return attrs
