from django.db import models

class Admin(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.email


class Buyer(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=255, default="Unknown")
    mobile = models.CharField(max_length=15)
    aadharPhoto = models.ImageField(upload_to='buyer/aadhar/')
    panCardPhoto = models.ImageField(upload_to='buyer/pan/')
    block = models.BooleanField(default=True)

    def __str__(self):
        return self.email


class Seller(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=255, default="Unknown")
    mobile = models.CharField(max_length=15)
    aadharPhoto = models.ImageField(upload_to='seller/aadhar/')
    panCardPhoto = models.ImageField(upload_to='seller/pan/')
    block = models.BooleanField(default=True)

    def __str__(self):
        return self.email


class PropertyType(models.Model):
    PROPERTY_CHOICES = [
        ('Sell', 'Sell'),
        ('Rent', 'Rent'),
    ]
    propertyTypeName = models.CharField(max_length=10, choices=PROPERTY_CHOICES, default='Sell')

    def __str__(self):
        return self.propertyTypeName


class Property(models.Model):
    propertyType = models.ForeignKey(PropertyType, on_delete=models.CASCADE)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE)
    city = models.CharField(max_length=100)
    propertyName = models.CharField(max_length=255)
    propertyPhoto = models.ImageField(upload_to='property/photos/')
    dimension = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    contactDetails = models.CharField(max_length=255)
    location = models.CharField(max_length=255, default='Null')

    description = models.TextField()
    approve = models.BooleanField(default=False)

    def __str__(self):
        return self.propertyName


class Papers(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='property/papers/')

    def __str__(self):
        return f"Papers for {self.property.propertyName}"

class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    b_chat = models.TextField(null=True, blank=True)  # Buyer's chat
    s_chat = models.TextField(null=True, blank=True) # Buyer chat
    buyer = models.ForeignKey('Buyer', on_delete=models.CASCADE)
    property = models.ForeignKey('Property', on_delete=models.CASCADE)

    def __str__(self):
        return f"Chat for {self.property.propertyName} - {self.buyer.email}"
    
