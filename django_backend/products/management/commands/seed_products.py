from django.core.management.base import BaseCommand
import json
import os
from products.models import Product, Category
from accounts.models import CustomUser, VendorProfile

class Command(BaseCommand):
    help = 'Seeds realistic Kenyan grocery products into the database'

    def handle(self, *args, **kwargs):
        fixture_path = os.path.join(os.path.dirname(__file__), '../../fixtures/products.json')
        
        # Create categories if they don't exist
        vegetables, _ = Category.objects.get_or_create(name='Vegetables', defaults={'slug': 'vegetables'})
        fruits, _ = Category.objects.get_or_create(name='Fruits', defaults={'slug': 'fruits'})
        grains, _ = Category.objects.get_or_create(name='Grains', defaults={'slug': 'grains'})

        # Setup a dummy vendor
        user, _ = CustomUser.objects.get_or_create(email='seed_vendor@example.com', defaults={'role': 'vendor', 'is_verified': True})
        if user.check_password('password'): pass 
        else: user.set_password('password'); user.save()

        vendor, _ = VendorProfile.objects.get_or_create(user=user, defaults={'shop_name': 'Neighbourhood Seed Farm', 'location': 'Nairobi'})

        if not os.path.exists(fixture_path):
            self.stdout.write(self.style.ERROR('Fixture not found. Generating...'))
            return

        with open(fixture_path, 'r') as f:
            products_data = json.load(f)

        category_cache = {}

        count = 0
        for item in products_data:
            fields = item['fields']
            category_name = fields.get('category_name', 'Miscellaneous')
            
            if category_name not in category_cache:
                cat_slug = category_name.lower().replace(' ', '-')
                cat_obj, _ = Category.objects.get_or_create(name=category_name, defaults={'slug': cat_slug})
                category_cache[category_name] = cat_obj
            
            cat = category_cache[category_name]
            
            Product.objects.update_or_create(
                name=fields['name'],
                defaults={
                    'vendor': vendor,
                    'description': fields['description'],
                    'category': cat,
                    'price': fields['price'],
                    'stock_quantity': fields['stock_quantity'],
                    'availability_status': fields['availability_status'],
                    'image': fields.get('image', '')
                }
            )
            count += 1
            
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} products!'))
