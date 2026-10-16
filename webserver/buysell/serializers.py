from rest_framework import serializers
from .models import Admin, Buyer, Seller, Property, PropertyType ,Papers ,Chat
import os

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'


class BuyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buyer
        fields = '__all__'


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seller
        fields = '__all__'


class PropertyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyType
        fields = '__all__'
        
 
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = '__all__' 

class PapersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Papers
        fields = '__all__'


import os  # Add this import at the top

class PropertySerializer(serializers.ModelSerializer):
    seller = serializers.EmailField(write_only=True)  # Accept email input but don't return it
    sellerName = serializers.CharField(source="seller.name", read_only=True)  # Return seller name
    propertyTypeName = serializers.CharField(source="propertyType.propertyTypeName", read_only=True)  # Fetch correct property type name

    class Meta:
        model = Property
        fields = [
            "id", "seller", "sellerName", "city", "propertyName", "propertyPhoto",
            "dimension", "location", "price", "contactDetails", "description", "approve",
            "propertyType", "propertyTypeName"
        ]

    def create(self, validated_data):
        seller_email = validated_data.pop("seller")
        try:
            seller = Seller.objects.get(email=seller_email)
        except Seller.DoesNotExist:
            raise serializers.ValidationError({"seller": "Seller with this email does not exist."})

        return Property.objects.create(seller=seller, **validated_data)

    def update(self, instance, validated_data):
        new_photo = validated_data.get("propertyPhoto", None)

        if new_photo and instance.propertyPhoto:
            if os.path.isfile(instance.propertyPhoto.path):
                os.remove(instance.propertyPhoto.path)

        seller_email = validated_data.pop("seller", None)
        if seller_email:
            try:
                seller = Seller.objects.get(email=seller_email)
                instance.seller = seller
            except Seller.DoesNotExist:
                raise serializers.ValidationError({"seller": "Seller with this email does not exist."})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


# class PropertySerializer(serializers.ModelSerializer):
#     seller = serializers.EmailField(write_only=True)  # Accept email input but don't return it
#     sellerName = serializers.CharField(source="seller.name", read_only=True)  # Return seller name

#     class Meta:
#         model = Property
#         fields = ["id", "seller", "sellerName", "city", "propertyName", "propertyPhoto", "dimension", 
#                   "price", "contactDetails", "description", "approve", "propertyType"]

#     def create(self, validated_data):
#         seller_email = validated_data.pop("seller")  # Extract seller email
#         try:
#             seller = Seller.objects.get(email=seller_email)  # Get Seller from email
#         except Seller.DoesNotExist:
#             raise serializers.ValidationError({"seller": "Seller with this email does not exist."})

#         return Property.objects.create(seller=seller, **validated_data)

    
    
