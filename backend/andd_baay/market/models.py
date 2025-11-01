from django.db import models
from projects.models import Project

class Product(models.Model):
    AVAILABILITY_CHOICES = (
        ('Available', 'Available'),
        ('Out of Stock', 'Out of Stock'),
        ('Pre-order', 'Pre-order'),
    )
    # A project can have multiple product listings (e.g. Grade A, Grade B)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='products')
    product_name = models.CharField(max_length=100)
    quantity = models.FloatField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20) # e.g., kg, tonne, item
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES)
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    
    def __str__(self):
        return self.product_name