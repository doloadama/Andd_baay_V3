from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'project', 'product_name', 'quantity', 'price', 
            'unit', 'availability_status', 'image'
        ]
        # The 'project' is set in the view, not by the user directly.
        read_only_fields = ('project',)