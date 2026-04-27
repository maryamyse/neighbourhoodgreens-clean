from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import VendorProfile

User = get_user_model()

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['id', 'shop_name', 'business_description', 'location', 'logo_url', 'is_verified', 'contact_phone']
        read_only_fields = ['is_verified']

class UserSerializer(serializers.ModelSerializer):
    vendor_profile = VendorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'profile_image', 'date_joined', 'is_verified', 'vendor_profile']
        read_only_fields = ['date_joined', 'is_verified', 'role']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='customer')
    
    # Optional vendor fields
    shop_name = serializers.CharField(max_length=255, required=False)
    location = serializers.CharField(max_length=255, required=False)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number', 'role', 'shop_name', 'location']

    def validate(self, attrs):
        role = attrs.get('role', 'customer')
        if role == 'vendor':
            if not attrs.get('shop_name') or not attrs.get('location'):
                raise serializers.ValidationError("Shop name and location are required for vendors.")
        return attrs

    def create(self, validated_data):
        shop_name = validated_data.pop('shop_name', None)
        location = validated_data.pop('location', None)
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data['role']
        )
        
        if user.role == 'vendor':
            VendorProfile.objects.create(
                user=user,
                shop_name=shop_name,
                location=location,
                contact_phone=user.phone_number
            )
            
        return user
