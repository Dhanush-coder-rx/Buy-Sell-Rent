from django.contrib import admin

from .models import Admin, Buyer, Seller, PropertyType, Property, Papers

admin.site.register(Admin)
admin.site.register(Buyer)
admin.site.register(Seller)
admin.site.register(PropertyType)
admin.site.register(Property)
admin.site.register(Papers)