from rest_framework import serializers
from .models import Site

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'name', 'location', 'farmer']
        read_only_fields = ('farmer',)