from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, status
from .models import Admin, Buyer, Seller, Property, PropertyType
from .serializers import (
    AdminSerializer, BuyerSerializer, SellerSerializer, 
    PropertySerializer, PropertyTypeSerializer
)


# ---------------------------------
# Admin Views
# ---------------------------------

class AdminLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        admin = Admin.objects.filter(email=email, password=password).first()
        if admin:
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class ManageUsersView(APIView):
    def get(self, request):
        buyers = Buyer.objects.all()
        sellers = Seller.objects.all()
        return Response({
            "buyers": BuyerSerializer(buyers, many=True).data,
            "sellers": SellerSerializer(sellers, many=True).data
        })

    def patch(self, request, user_type, user_id):
        if user_type == "buyer":
            user = get_object_or_404(Buyer, id=user_id)
        elif user_type == "seller":
            user = get_object_or_404(Seller, id=user_id)
        else:
            return Response({"error": "Invalid user type"}, status=status.HTTP_400_BAD_REQUEST)

        user.block = not user.block  # Toggle block status
        user.save()
        return Response({"message": f"{user_type} updated successfully"})


class VerifyPropertyView(APIView):
    def get(self, request):
        properties = Property.objects.filter(approve=False)
        return Response(PropertySerializer(properties, many=True).data)

    def patch(self, request, property_id):
        property = get_object_or_404(Property, id=property_id)
        property.approve = True
        property.save()
        return Response({"message": "Property approved successfully"})


class AdminUpdatePassword(APIView):
    def patch(self, request, admin_id):
        admin = get_object_or_404(Admin, id=admin_id)
        admin.password = make_password(request.data.get("new_password"))
        admin.save()
        return Response({"message": "Password updated successfully"})


# ---------------------------------
# Seller Views
# ---------------------------------

class SellerRegisterView(generics.CreateAPIView):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer


class SellerLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        seller = Seller.objects.filter(email=email, password=password).first()
        if seller:
            return Response({"message": "Login successful"})
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class SellerUploadDocuments(APIView):
    def patch(self, request, seller_id):
        seller = get_object_or_404(Seller, id=seller_id)
        seller.aadharPhoto = request.FILES.get("aadharPhoto")
        seller.panCardPhoto = request.FILES.get("panCardPhoto")
        seller.save()
        return Response({"message": "Documents uploaded successfully"})


class SellerPostProperty(generics.CreateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer


class SellerUpdateProfile(APIView):
    def patch(self, request, seller_id):
        seller = get_object_or_404(Seller, id=seller_id)
        serializer = SellerSerializer(seller, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------
# Buyer Views
# ---------------------------------

class BuyerRegisterView(generics.CreateAPIView):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer


class BuyerLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        buyer = Buyer.objects.filter(email=email, password=password).first()
        if buyer:
            return Response({"message": "Login successful"})
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class SearchPropertyView(APIView):
    def get(self, request, city, property_type):
        properties = Property.objects.filter(city=city, propertyType__propertyTypeName=property_type, approve=True)
        return Response(PropertySerializer(properties, many=True).data)


class BuyerUpdateProfile(APIView):
    def patch(self, request, buyer_id):
        buyer = get_object_or_404(Buyer, id=buyer_id)
        serializer = BuyerSerializer(buyer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
