from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'phone', 'location', 'role']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        full_name = validated_data.pop('name', '')
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            phone=validated_data.get('phone', ''),
            location=validated_data.get('location', ''),
            role=validated_data.get('role', 'FARMER')
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'location', 'role']
        read_only_fields = ['email', 'role']
    
    def update(self, instance, validated_data):
        if 'name' in validated_data:
            full_name = validated_data.pop('name', '')
            name_parts = full_name.split(' ', 1)
            instance.first_name = name_parts[0]
            instance.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        instance.phone = validated_data.get('phone', instance.phone)
        instance.location = validated_data.get('location', instance.location)
        instance.save()
        return instance