from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .models import Admin, Buyer, Seller, Property, PropertyType ,Papers , Chat 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.urls import get_resolver
from django.urls import get_resolver, URLPattern, URLResolver
from .serializers import PapersSerializer
from rest_framework.response import Response
from django.http import JsonResponse
from .serializers import ChatSerializer
from django.conf import settings
from django.utils.timezone import now
import os


from .serializers import (
    AdminSerializer, BuyerSerializer, SellerSerializer, 
    PropertySerializer, PropertyTypeSerializer
)

def get_all_urls(urlpatterns, base_path=""):
    """ Recursively fetch all URL patterns """
    url_list = []
    
    for pattern in urlpatterns:
        if isinstance(pattern, URLPattern):  # If it's a direct URL
            url_list.append(base_path + str(pattern.pattern))
        elif isinstance(pattern, URLResolver):  # If it's a nested URL resolver
            url_list.extend(get_all_urls(pattern.url_patterns, base_path + str(pattern.pattern)))

    return url_list

def listapis(request):
    #Dynamically fetch and return all available API endpoints
    resolver = get_resolver()
    api_list = get_all_urls(resolver.url_patterns)
 
    return JsonResponse({"available_apis": api_list}, status=200)

# ---------------------------------
# Admin Views
# ---------------------------------

@api_view(['POST'])
def admin_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    admin = Admin.objects.filter(email=email, password=password).first()
    if admin:
        return JsonResponse({"message": "Login successful"}, status=status.HTTP_200_OK)
    return JsonResponse({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def manage_users(request):
    buyers = Buyer.objects.all()
    sellers = Seller.objects.all()
    return JsonResponse({
        "buyers": list(BuyerSerializer(buyers, many=True).data),
        "sellers": list(SellerSerializer(sellers, many=True).data)
    }, safe=False)


@api_view(['PATCH'])
def toggle_user_block(request, user_type, user_id):
    if user_type == "buyers":
        user = get_object_or_404(Buyer, id=user_id)
    elif user_type == "sellers":
        user = get_object_or_404(Seller, id=user_id)
    else:
        return JsonResponse({"error": "Invalid user type"}, status=status.HTTP_400_BAD_REQUEST)

    user.block = not user.block  # Toggle block status
    user.save()
    return JsonResponse({"message": f"{user_type} status updated successfully"})


@api_view(['GET'])
def unverified_properties(request):
    properties = Property.objects.filter(approve=False).select_related("seller")  # Ensure related lookup
    serialized_data = PropertySerializer(properties, many=True).data
    return JsonResponse({"properties": serialized_data}, safe=False)


@api_view(['GET'])
def get_properties_by_seller(request):
    email = request.GET.get("email")  # Extract email from query parameters
    if not email:
        return JsonResponse({"error": "Email parameter is required"}, status=400)

    properties = Property.objects.filter(seller__email=email).select_related("seller", "propertyType")
    
    if not properties.exists():
        return JsonResponse({"error": "No properties found for this seller"}, status=404)

    serialized_data = PropertySerializer(properties, many=True).data
    return JsonResponse({"properties": serialized_data}, safe=False)




@api_view(['PATCH'])
def approve_property(request, property_id):
    property = get_object_or_404(Property, id=property_id)
    property.approve = True
    property.save()
    return JsonResponse({"message": "Property approved successfully"})


@api_view(['PATCH'])
def admin_update_password(request):
    email = request.data.get("email")
    old_password = request.data.get("oldPassword")
    new_password = request.data.get("newPassword")
    confirm_password = request.data.get("confirmPassword")

    if not email or not old_password or not new_password or not confirm_password:
        return JsonResponse({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return JsonResponse({"error": "New password and confirm password do not match"}, status=status.HTTP_400_BAD_REQUEST)

    admin = Admin.objects.filter(email=email).first()
    if not admin:
        return JsonResponse({"error": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)

    # Direct comparison (ONLY works if passwords are stored in plain text)
    if admin.password != old_password:
        return JsonResponse({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)

    admin.password = new_password  # Store new password as plain text (BAD PRACTICE)
    admin.save()

    return JsonResponse({"message": "Password updated successfully"}, status=status.HTTP_200_OK)


# ---------------------------------
# Seller Views
# ---------------------------------

@api_view(['POST'])
def seller_register(request):
    serializer = SellerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Seller registered successfully"}, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def seller_login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    seller = Seller.objects.filter(email=email, password=password).first()

    if seller:
        if seller.block:  # Check if the seller is blocked
            return JsonResponse({"error": "Your account is blocked. Contact support."}, status=status.HTTP_403_FORBIDDEN)
        
        return JsonResponse({"message": "Login successful"}, status=status.HTTP_200_OK)

    return JsonResponse({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def seller_upload_documents(request, seller_id):
    seller = get_object_or_404(Seller, id=seller_id)
    seller.aadharPhoto = request.FILES.get("aadharPhoto")
    seller.panCardPhoto = request.FILES.get("panCardPhoto")
    seller.save()
    return JsonResponse({"message": "Documents uploaded successfully"})




@api_view(['POST'])
@permission_classes([AllowAny])
def seller_post_property(request):
    print("Received Data:", request.data)  # Debugging Line
    serializer = PropertySerializer(data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Property posted successfully"}, status=status.HTTP_201_CREATED)
    
    print("Errors:", serializer.errors)  # Debugging Line
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['PATCH'])  # support both PUT and PATCH
@permission_classes([AllowAny])
def update_property(request, property_id):
    try:
        property_instance = Property.objects.get(pk=property_id)
    except Property.DoesNotExist:
        return JsonResponse({"error": "Property not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = PropertySerializer(property_instance, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Property updated successfully."}, status=status.HTTP_200_OK)

    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def get_property_types(request):
    property_types = list(PropertyType.objects.values())  # List of dictionaries
    return JsonResponse(property_types, safe=False)  # Set safe=False to allow lists



@api_view(['PATCH'])
@permission_classes([AllowAny])
def seller_update_password(request):
    email = request.data.get("email")
    old_password = request.data.get("oldPassword")
    new_password = request.data.get("newPassword")
    confirm_password = request.data.get("confirmPassword")

    
    if not email or not old_password or not new_password or not confirm_password:
        return JsonResponse({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return JsonResponse({"error": "New password and confirm password do not match"}, status=status.HTTP_400_BAD_REQUEST)

    seller = Seller.objects.filter(email=email).first()
    if not seller:
        return JsonResponse({"error": "Seller not found"}, status=status.HTTP_404_NOT_FOUND)

    # Direct comparison (ONLY works if passwords are stored in plain text)
    if seller.password != old_password:
        return JsonResponse({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)

    seller.password = new_password  # Store new password as plain text (BAD PRACTICE)
    seller.save()

    return JsonResponse({"message": "Password updated successfully"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def upload_paper(request, propertyId):
    print("Received Data:", request.data)
    print("Received FILES:", request.FILES)

    try:
        property_instance = Property.objects.get(id=propertyId)
    except Property.DoesNotExist:
        return Response({"error": "Property not found"}, status=status.HTTP_404_NOT_FOUND)

    if "image" not in request.FILES:
        return Response({"error": "File not provided or incorrect key name"}, status=status.HTTP_400_BAD_REQUEST)

    mutable_data = request.data.copy()
    mutable_data["property"] = property_instance.id  # Ensure field name matches serializer

    serializer = PapersSerializer(data=mutable_data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Paper uploaded successfully"}, status=status.HTTP_201_CREATED)

    print("Serializer Errors:", serializer.errors)  # Log errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_paper_by_filename(request, filename):
    try:
        paper = Papers.objects.get(image__contains=filename)
    except Papers.DoesNotExist:
        return JsonResponse({"error": "Paper not found in DB."}, status=404)

    paper_path = paper.image.path  # this gives the actual full path on disk
    print("Trying to delete:", paper_path)

    if os.path.isfile(paper_path):
        try:
            os.remove(paper_path)
            paper.delete()  # Also delete the DB record
            return JsonResponse({"message": "Paper deleted successfully."}, status=200)
        except Exception as e:
            return JsonResponse({"error": "Delete failed.", "details": str(e)}, status=500)
    else:
        return JsonResponse({"error": "File not found on disk."}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_papers(request, property_id):
    """Retrieve all papers for a specific property."""
    try:
        property_obj = Property.objects.get(id=property_id)
        papers = Papers.objects.filter(property=property_obj)
        serializer = PapersSerializer(papers, many=True)
        return JsonResponse({"papers": serializer.data}, safe=False)
    except Property.DoesNotExist:
        return JsonResponse({"error": "Property not found"}, status=status.HTTP_404_NOT_FOUND)
    

# ---------------------------------
# Buyer Views
# ---------------------------------

@api_view(['GET'])
def get_approved_properties(request):
    approved_properties = Property.objects.filter(approve=True)

    if not approved_properties.exists():
        return JsonResponse({"message": "No approved properties found."}, status=404)

    properties_data = []
    for prop in approved_properties:
        # Fetch papers related to this property
        papers = Papers.objects.filter(property=prop)

        # Ensure the image field exists and is accessible
        paper_images = []
        for p in papers:
            if p.image:  # Check if image field is not None
                paper_images.append(request.build_absolute_uri(p.image.url))

        # Check if propertyPhoto exists before accessing .url
        property_photo_url = request.build_absolute_uri(prop.propertyPhoto.url) if prop.propertyPhoto else None

        properties_data.append({
            "id": prop.id,
            "name": getattr(prop, "propertyName", "N/A"),  # Avoid AttributeError
            "seller": getattr(prop, "sellerName", "N/A"),
            "type": getattr(prop, "propertyTypeName", "N/A"),
            "city": getattr(prop, "city", "N/A"),
            "dimension": getattr(prop, "dimension", "N/A"),
            "price": getattr(prop, "price", "N/A"),
            "contact": getattr(prop, "contactDetails", "N/A"),
            "description": getattr(prop, "description", "N/A"),
            "image": property_photo_url,
            "papers": paper_images
        })

    return JsonResponse({"approved_properties": properties_data}, safe=False)

@api_view(['POST'])
@permission_classes([AllowAny])
def buyer_register(request):
    serializer = BuyerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Buyer registered successfully"}, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def buyer_login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    buyer = Buyer.objects.filter(email=email, password=password).first()

    if buyer:
        if buyer.block:  # Check if the buyer is blocked
            return JsonResponse({"error": "Your account is blocked. Contact support."}, status=status.HTTP_403_FORBIDDEN)

        return JsonResponse({"message": "Login successful"}, status=status.HTTP_200_OK)

    return JsonResponse({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_property(request, city, property_type):
    properties = Property.objects.filter(city=city, propertyType__propertyTypeName=property_type, approve=True)
    return JsonResponse({"properties": list(PropertySerializer(properties, many=True).data)}, safe=False)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def buyer_update_password(request):
    email = request.data.get("email")
    old_password = request.data.get("oldPassword")
    new_password = request.data.get("newPassword")
    confirm_password = request.data.get("confirmPassword")

    
    if not email or not old_password or not new_password or not confirm_password:
        return JsonResponse({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return JsonResponse({"error": "New password and confirm password do not match"}, status=status.HTTP_400_BAD_REQUEST)

    buyer = Buyer.objects.filter(email=email).first()
    if not buyer:
        return JsonResponse({"error": "Buyer not found"}, status=status.HTTP_404_NOT_FOUND)

    # Direct comparison (ONLY works if passwords are stored in plain text)
    if buyer.password != old_password:
        return JsonResponse({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)

    buyer.password = new_password  # Store new password as plain text (BAD PRACTICE)
    buyer.save()

    return JsonResponse({"message": "Password updated successfully"}, status=status.HTTP_200_OK)


# ---------------------------------
# Chat 
# ---------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow access to all users
def create_chat(request):
    buyer_email = request.data.get("buyer_email")  # Get email from request

    if not buyer_email:
        return Response({"error": "Buyer email is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Find the Buyer object based on email
    buyer = get_object_or_404(Buyer, email=buyer_email)

    # Create a mutable copy of request data to modify
    chat_data = request.data.copy()
    chat_data["buyer"] = buyer.id  # Set buyer ID instead of email

    serializer = ChatSerializer(data=chat_data)
    if serializer.is_valid():
        serializer.save(date=now())  # Set current datetime
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([AllowAny])  # Allows access to anyone
def update_chat(request, pk):
    try:
        chat = Chat.objects.get(pk=pk)
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found"}, status=status.HTTP_404_NOT_FOUND)

    s_chat = request.data.get('s_chat', None)
    if s_chat is not None:
        chat.s_chat = s_chat
        chat.date = now()  # Update datetime
        chat.save()
        return Response({"message": "Chat updated successfully", "s_chat": chat.s_chat, "date": chat.date},
                        status=status.HTTP_200_OK)
    
    return Response({"error": "s_chat field is required"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])  # Allows unrestricted access
def get_chats_by_buyer(request):
    email = request.GET.get('email')  # Extract email from request params

    if not email:
        return Response({"error": "Email parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch only chat records where this buyer has chatted
    chats = Chat.objects.filter(buyer__email=email).select_related('property__seller')

    if not chats.exists():
        return Response({"message": "No chat records found for this buyer"}, status=status.HTTP_404_NOT_FOUND)

    chat_data = []
    for chat in chats:
        property_obj = chat.property
        seller_obj = property_obj.seller  # Get seller details
        papers = Papers.objects.filter(property=property_obj)  # Fetch all related paper images

        chat_data.append({
            "chat_id": chat.id,
            "date": chat.date,
            "s_chat": chat.s_chat,
            "b_chat": chat.b_chat,
            "property": {
                "id": property_obj.id,
                "propertyType": property_obj.propertyType.id,  # Assuming propertyType is another model
                "seller": {
                    "id": seller_obj.id,
                    "name": seller_obj.name,
                    "email": seller_obj.email,
                    "mobile": seller_obj.mobile
                },  # Added seller information
                "city": property_obj.city,
                "propertyName": property_obj.propertyName,
                "propertyPhoto": request.build_absolute_uri(property_obj.propertyPhoto.url) if property_obj.propertyPhoto else None,
                "dimension": property_obj.dimension,
                "price": property_obj.price,
                "contactDetails": property_obj.contactDetails,
                "description": property_obj.description,
                "approve": property_obj.approve,
                "papers": [
                    request.build_absolute_uri(paper.image.url) for paper in papers
                ]  # List of paper images
            }
        })

    return Response({"chats": chat_data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])  # Allows unrestricted access
def get_chats_by_seller(request):
    email = request.GET.get('email')  # Extract seller email from request params

    if not email:
        return Response({"error": "Email parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch properties owned by this seller
    properties = Property.objects.filter(seller__email=email)

    if not properties.exists():
        return Response({"message": "No properties found for this seller"}, status=status.HTTP_404_NOT_FOUND)

    chat_data = []
    for property_obj in properties:
        # Fetch chats linked to this property
        chats = Chat.objects.filter(property=property_obj)

        if not chats.exists():
            continue  # Skip properties with no chats

        property_papers = Papers.objects.filter(property=property_obj)  # Fetch property papers

        for chat in chats:
            chat_data.append({
                "chat_id": chat.id,
                "date": chat.date,
                "s_chat": chat.s_chat,
                "b_chat": chat.b_chat,
                "buyer_email": chat.buyer.email,  # Include buyer info
                "property": {
                    "id": property_obj.id,
                    "propertyType": property_obj.propertyType.id,
                    "seller_id": property_obj.seller.id,
                    "city": property_obj.city,
                    "propertyName": property_obj.propertyName,
                    "propertyPhoto": request.build_absolute_uri(property_obj.propertyPhoto.url) if property_obj.propertyPhoto else None,
                    "dimension": property_obj.dimension,
                    "price": property_obj.price,
                    "contactDetails": property_obj.contactDetails,
                    "description": property_obj.description,
                    "approve": property_obj.approve,
                    "papers": [
                        request.build_absolute_uri(paper.image.url) for paper in property_papers
                    ]  # List of property papers
                }
            })

    if not chat_data:
        return Response({"message": "No chat records found for this seller"}, status=status.HTTP_404_NOT_FOUND)

    return Response({"chats": chat_data}, status=status.HTTP_200_OK)