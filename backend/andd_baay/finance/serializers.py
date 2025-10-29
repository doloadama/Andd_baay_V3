from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'type', 'amount', 'date', 'description', 'site', 'project', 'category']
        read_only_fields = ('user',)