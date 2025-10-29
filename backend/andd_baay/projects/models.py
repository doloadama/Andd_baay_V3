from django.db import models
from sites.models import Site

class Project(models.Model):
    STATUS_CHOICES = (
        ('Planning', 'Planning'),
        ('In Progress', 'In Progress'),
        ('Harvesting', 'Harvesting'),
        ('Completed', 'Completed'),
    )
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=100)
    description = models.TextField()
    crop_type = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    expected_yield = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planning')

    def __str__(self):
        return self.name