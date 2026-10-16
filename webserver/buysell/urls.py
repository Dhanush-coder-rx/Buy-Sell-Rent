from django.urls import path
from .views import (
    admin_login, manage_users, toggle_user_block, unverified_properties, approve_property, admin_update_password,
    seller_register, seller_login, seller_upload_documents, seller_post_property,get_property_types, seller_update_password,
    buyer_register, buyer_login, search_property, update_property,buyer_update_password,get_approved_properties,get_chats_by_seller,get_chats_by_buyer,create_chat,update_chat ,get_properties_by_seller,upload_paper,get_papers , listapis
)

urlpatterns = [
    # Admin Routes

    path('list/', listapis, name='list_all_apis'),

    path('admin/login/', admin_login),
    path('admin/manage-users/', manage_users),
    path('admin/manage-users/<str:user_type>/<int:user_id>/', toggle_user_block),
    path('admin/unverified-properties/', unverified_properties),
    path('admin/approve-property/<int:property_id>/', approve_property),
    path('admin/updatePasswordForAdmin/', admin_update_password),

    # Seller Routes
    path('seller/register/', seller_register),
    path('seller/login/', seller_login),
    path('seller/upload-documents/<int:seller_id>/', seller_upload_documents),
    path('seller/post-property/', seller_post_property),
    path('seller/property-types/', get_property_types, name='property-types'),
   
    path('seller/update-property/<int:property_id>/', update_property, name='update_property'),

    path('seller/updatePasswordForSeller/', seller_update_password),

    path('seller/properties/', get_properties_by_seller, name='get-properties-by-seller'),

    path('admin/upload-documents/<int:propertyId>/', upload_paper, name='upload_paper'),
    path('admin/get-papers/<int:property_id>/', get_papers, name='get-papers'),

   
    path('admin/approved-properties/', get_approved_properties, name='approved-properties'),

    path('buyer/chats/', create_chat, name='chat-create'),  
    path('get/buyer/chats/', get_chats_by_buyer, name='get-chats-by-buyer'),
    path('seller/chats/<int:pk>/', update_chat, name='chat-update'),
    path('seller/chats/', get_chats_by_seller, name='get_chats_by_seller'),


    # Buyer Routes
    path('buyer/register/', buyer_register),
    path('buyer/login/', buyer_login),
    path('buyer/search-property/<str:city>/<str:property_type>/', search_property),
    path('buyer/updatePasswordForBuyer/', buyer_update_password),
]

