from django.db import models
from users.models import User
from projects.models import Project
from sites.models import Site

class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    EXPENSE_CATEGORY_CHOICES = (
        ('Equipment', 'Equipment'),
        ('Supplies', 'Supplies'),
        ('Infrastructure', 'Infrastructure'),
        ('Labor', 'Labor'),
        ('Utilities', 'Utilities'),
        ('Other', 'Other'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=7, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    description = models.CharField(max_length=255)
    
    site = models.ForeignKey(Site, on_delete=models.SET_NULL, null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    
    category = models.CharField(
        max_length=50, 
        choices=EXPENSE_CATEGORY_CHOICES, 
        null=True, 
        blank=True
    )

    def __str__(self):
        return f"{self.type.capitalize()} of {self.amount} for {self.user.email}"