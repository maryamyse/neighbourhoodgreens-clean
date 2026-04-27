from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from accounts.models import VendorProfile

User = get_user_model()

def validate_image_size(image):
    max_size_mb = 5
    if image.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Image size cannot exceed {max_size_mb} MB.")

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'categories'

class Product(models.Model):
    availability_choices = (
        ('in_stock', 'In Stock'),
        ('out_of_stock', 'Out of Stock'),
    )

    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', validators=[validate_image_size], null=True, blank=True)
    availability_status = models.CharField(max_length=20, choices=availability_choices, default='in_stock')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def check_stock_status(self):
        if self.stock_quantity <= 0:
            self.availability_status = 'out_of_stock'
        else:
            self.availability_status = 'in_stock'
        
    def save(self, *args, **kwargs):
        self.check_stock_status()
        super().save(*args, **kwargs)
