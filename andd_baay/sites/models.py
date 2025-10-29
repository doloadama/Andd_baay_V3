from django.db import models
from users.models import User

MALI_REGIONS = [
    'Kayes', 'Koulikoro', 'Sikasso', 'Ségou', 'Mopti',
    'Tombouctou', 'Gao', 'Kidal', 'Taoudénit', 'Ménaka', 'Bamako'
]
MALI_REGIONS_CHOICES = [(region, region) for region in MALI_REGIONS]

class Site(models.Model):
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sites')
    name = models.CharField(max_length=100)
    location = models.CharField(
        max_length=100,
        choices=MALI_REGIONS_CHOICES,
        default='Bamako'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.farmer.email})"