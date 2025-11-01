from rest_framework import serializers
from .models import Transaction, Investment

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'type', 'amount', 'date', 'description', 'site', 'project', 'category']
        read_only_fields = ('user',)

class InvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = ['id', 'user', 'name', 'amount', 'date', 'description', 'related_project']
        read_only_fields = ('user',)