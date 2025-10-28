# Andd Baay: Django Backend Setup Guide

This document contains all the code and instructions needed to build the complete Django backend for the Andd Baay agricultural platform. This version includes full CRUD functionality for farmers to manage their sites, projects, products, and financials, plus a dedicated analytics endpoint.

## 1. Prerequisites

- Python 3.8+ and Pip
- PostgreSQL
- A virtual environment tool (e.g., `venv`)

## 2. Initial Project Setup

Follow these steps in your terminal:

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Create a file for project requirements
touch requirements.txt

# 3. Create the Django project and initial apps
pip install django
django-admin startproject andd_baay
cd andd_baay
python manage.py startapp users
python manage.py startapp sites
python manage.py startapp projects
python manage.py startapp market
python manage.py startapp analytics
python manage.py startapp finance
```

This will create the necessary folder structure. Now, you'll populate the files with the code below.

## 3. Project Dependencies

Open `requirements.txt` in the root of your project (outside the `andd_baay` folder) and add the following lines. Then, install them.

**File: `/requirements.txt`**
```
django
djangorestframework
psycopg2-binary
djangorestframework-simplejwt
django-cors-headers
django-filter
Pillow
```

```bash
# Install the dependencies
pip install -r requirements.txt
```

---

## 4. Configure Django Settings

Replace the contents of `andd_baay/andd_baay/settings.py` with the following. **Remember to fill in your PostgreSQL database credentials.**

**File: `andd_baay/andd_baay/settings.py`**
```python
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-your-secret-key-here' # Replace with a real secret key
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'users.apps.UsersConfig',
    'sites.apps.SitesConfig',
    'projects.apps.ProjectsConfig',
    'market.apps.MarketConfig',
    'analytics.apps.AnalyticsConfig',
    'finance.apps.FinanceConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # CORS Middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'andd_baay.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'andd_baay.wsgi.application'

# --- Database (PostgreSQL) ---
# Make sure you have a database named 'andd_baay' created in PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'andd_baay',
        'USER': 'your_postgres_user',       # <-- Replace
        'PASSWORD': 'your_postgres_password', # <-- Replace
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Custom User Model ---
AUTH_USER_MODEL = 'users.User'

# --- Django REST Framework ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
}

# --- JWT Settings ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# --- CORS Settings ---
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", # Add your frontend URL here
    "http://127.0.0.1:3000",
]
```

---

## 5. Models (Users, Sites, Projects, Market, Finance)
Create the models for each app.

### 5.1 Users App
**File: `andd_baay/users/models.py`**
```python
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('FARMER', 'Farmer'),
        ('SELLER', 'Seller'),
        ('BOTH', 'Both'),
    )
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='FARMER')

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return self.email
```
### 5.2 Sites App
**File: `andd_baay/sites/models.py`**
```python
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
```

### 5.3 Projects App
**File: `andd_baay/projects/models.py`**
```python
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
```

### 5.4 Market App
**File: `andd_baay/market/models.py`**
```python
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
```

### 5.5 Finance App
**File: `andd_baay/finance/models.py`**
```python
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
```

### 5.6 App Configurations
Update the `apps.py` file for all apps to ensure consistency.

**File: `andd_baay/users/apps.py`**
```python
from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
```
*(Repeat this pattern for `sites`, `projects`, `market`, `finance` and `analytics` apps as well.)*

---

## 6. Permissions
Create custom permission files for apps that need object-level permissions.

**File: `andd_baay/sites/permissions.py`**
```python
from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.farmer == request.user
```

**File: `andd_baay/projects/permissions.py`**
```python
from rest_framework import permissions

class IsSiteOwner(permissions.BasePermission):
    """
    Custom permission to only allow the owner of a site to manage its projects.
    """
    def has_object_permission(self, request, view, obj):
        return obj.site.farmer == request.user
```

**File: `andd_baay/market/permissions.py`**
```python
from rest_framework import permissions

class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission for Products.
    Allows read-only access for anyone.
    Allows write access only to the farmer who owns the associated project.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.project.site.farmer == request.user

```

**File: `andd_baay/finance/permissions.py`**
```python
from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a transaction to view/edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
```

---

## 7. Serializers and Views

### 7.1 Users App

**File: `andd_baay/users/serializers.py`**
```python
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'phone', 'location', 'role']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        full_name = validated_data.pop('name', '')
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            phone=validated_data.get('phone', ''),
            location=validated_data.get('location', ''),
            role=validated_data.get('role', 'FARMER')
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'location', 'role']
        read_only_fields = ['email', 'role']
    
    def update(self, instance, validated_data):
        if 'name' in validated_data:
            full_name = validated_data.pop('name', '')
            name_parts = full_name.split(' ', 1)
            instance.first_name = name_parts[0]
            instance.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        instance.phone = validated_data.get('phone', instance.phone)
        instance.location = validated_data.get('location', instance.location)
        instance.save()
        return instance
```

**File: `andd_baay/users/views.py`**
```python
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, ProfileSerializer
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        user = request.user
        serializer = ProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 7.2 Sites App
**File: `andd_baay/sites/serializers.py`**
```python
from rest_framework import serializers
from .models import Site

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'name', 'location', 'farmer']
        read_only_fields = ('farmer',)
```
**File: `andd_baay/sites/views.py`**
```python
from rest_framework import viewsets
from .models import Site
from .serializers import SiteSerializer
from .permissions import IsOwner

class SiteViewSet(viewsets.ModelViewSet):
    serializer_class = SiteSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        return Site.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)
```

### 7.3 Projects App
**File: `andd_baay/projects/serializers.py`**
```python
from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        # site is writable so user can select it
```
**File: `andd_baay/projects/views.py`**
```python
from rest_framework import viewsets, serializers
from rest_framework.exceptions import PermissionDenied
from .models import Project
from sites.models import Site
from .serializers import ProjectSerializer
from .permissions import IsSiteOwner

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsSiteOwner]

    def get_queryset(self):
        return Project.objects.filter(site__farmer=self.request.user)

    def perform_create(self, serializer):
        site_id = self.request.data.get('siteId') # Match frontend key
        if not site_id:
            raise serializers.ValidationError({"siteId": "This field is required."})
        
        try:
            site = Site.objects.get(id=site_id)
            if site.farmer != self.request.user:
                raise PermissionDenied("You can only create projects on your own sites.")
            serializer.save(site=site)
        except Site.DoesNotExist:
            raise serializers.ValidationError({"siteId": "Site not found."})
```

### 7.4 Market App

**File: `andd_baay/market/serializers.py`**
```python
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'project', 'product_name', 'quantity', 'price', 
            'unit', 'availability_status', 'image'
        ]
        # The 'project' is set in the view, not by the user directly.
        read_only_fields = ('project',)
```

**File: `andd_baay/market/views.py`**
```python
from rest_framework import viewsets, serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied
from .models import Product
from projects.models import Project
from .serializers import ProductSerializer
from .permissions import IsProjectOwnerOrReadOnly

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('project', 'project__site').order_by('-id')
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser) # Support file uploads

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsProjectOwnerOrReadOnly]
        return super(ProductViewSet, self).get_permissions()

    def perform_create(self, serializer):
        project_id = self.request.data.get('projectId') # Match frontend key
        if not project_id:
            raise serializers.ValidationError({"projectId": "This field is required."})
            
        try:
            project = Project.objects.get(id=project_id)
            if project.site.farmer != self.request.user:
                raise PermissionDenied("You can only create products for your own projects.")
            serializer.save(project=project)
        except Project.DoesNotExist:
            raise serializers.ValidationError({"projectId": "Project not found."})
```

### 7.5 Finance App
**File: `andd_baay/finance/serializers.py`**
```python
from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'type', 'amount', 'date', 'description', 'site', 'project', 'category']
        read_only_fields = ('user',)
```
**File: `andd_baay/finance/views.py`**
```python
from rest_framework import viewsets
from .models import Transaction
from .serializers import TransactionSerializer
from .permissions import IsOwner

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

### 7.6 Analytics App
**File: `andd_baay/analytics/views.py`**
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, F
from projects.models import Project
from market.models import Product

class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        project_status_data = list(Project.objects.values('status').annotate(value=Count('id')).values('status', 'value'))
        project_status_data = [{'name': item['status'], 'value': item['value']} for item in project_status_data]

        revenue_by_crop_data = list(
            Product.objects.values('project__crop_type')
            .annotate(revenue=Sum(F('price') * F('quantity')))
            .values('project__crop_type', 'revenue')
        )
        revenue_by_crop_data = [
            {'name': item['project__crop_type'], 'revenue': item['revenue']}
            for item in revenue_by_crop_data
        ]

        yield_by_crop_data = list(
            Project.objects.values('crop_type')
            .annotate(yield_sum=Sum('expected_yield'))
            .values('crop_type', 'yield_sum')
        )
        yield_by_crop_data = [
            {'name': item['crop_type'], 'yield': item['yield_sum']}
            for item in yield_by_crop_data
        ]

        summary_data = {
            'projectStatusData': project_status_data,
            'revenueByCropData': revenue_by_crop_data,
            'yieldByCropData': yield_by_crop_data,
        }
        
        return Response(summary_data)
```

---

## 8. URL Configuration
Configure the URLs for each app and the main project.

**File: `andd_baay/users/urls.py`**
```python
from django.urls import path
from .views import RegisterView, ProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
```

**File: `andd_baay/analytics/urls.py`**
```python
from django.urls import path
from .views import AnalyticsSummaryView

urlpatterns = [
    path('summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
]
```


**File: `andd_baay/andd_baay/urls.py`**
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from sites.views import SiteViewSet
from projects.views import ProjectViewSet
from market.views import ProductViewSet
from finance.views import TransactionViewSet

router = DefaultRouter()
router.register(r'sites', SiteViewSet, basename='site')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'finance/transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 9. Data Seeding Script
Create a Python script to populate the database with initial data.

**File: `/seed_data.py`** (in the root of your project, alongside `manage.py`)
```python
import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'andd_baay.settings')
django.setup()

from users.models import User
from sites.models import Site
from projects.models import Project
from market.models import Product
from finance.models import Transaction

def seed_data():
    # Clear existing data
    Transaction.objects.all().delete()
    Product.objects.all().delete()
    Project.objects.all().delete()
    Site.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()

    print("Seeding data...")

    # Create Users
    u1 = User.objects.create_user('adama@farm.com', 'password123', first_name='Adama', last_name='Traoré', phone='555-0101', location='Kayes', role='FARMER')
    u2 = User.objects.create_user('binta@market.com', 'password123', first_name='Binta', last_name='Diallo', phone='555-0102', location='Sikasso', role='SELLER')
    u3 = User.objects.create_user('moussa@agri.com', 'password123', first_name='Moussa', last_name='Coulibaly', phone='555-0103', location='Koulikoro', role='BOTH')
    u4 = User.objects.create_user('fatou@farm.com', 'password123', first_name='Fatoumata', last_name='Keita', phone='555-0104', location='Ségou', role='FARMER')

    # Create Sites
    s1 = Site.objects.create(farmer=u1, name='Kayes Sun Farm', location='Kayes')
    s2 = Site.objects.create(farmer=u1, name='River Field', location='Kayes')
    s3 = Site.objects.create(farmer=u3, name='Koulikoro Oasis', location='Koulikoro')
    s4 = Site.objects.create(farmer=u4, name='Ségou Fertile Lands', location='Ségou')

    # Create Projects
    p1 = Project.objects.create(site=s1, name='Mango Season 2024', description='Organic Kent mango cultivation.', crop_type='Mango', start_date=date(2024, 3, 1), end_date=date(2024, 8, 15), expected_yield=5000, status='Harvesting')
    p2 = Project.objects.create(site=s2, name='Millet Harvest', description='High-yield pearl millet for local markets.', crop_type='Millet', start_date=date(2024, 6, 1), end_date=date(2024, 10, 30), expected_yield=10000, status='In Progress')
    p3 = Project.objects.create(site=s3, name='Tomato Greenhouse', description='Year-round tomato production.', crop_type='Tomato', start_date=date(2024, 1, 1), end_date=date(2024, 12, 31), expected_yield=2000, status='Completed')
    p4 = Project.objects.create(site=s3, name='Okra Planting', description='Early-season okra for premium price.', crop_type='Okra', start_date=date(2024, 4, 15), end_date=date(2024, 7, 20), expected_yield=1500, status='Harvesting')
    p5 = Project.objects.create(site=s4, name='Rice Paddy Cultivation', description='High-quality rice for export.', crop_type='Rice', start_date=date(2024, 5, 20), end_date=date(2024, 11, 10), expected_yield=25000, status='In Progress')
    
    # Create Products
    Product.objects.create(project=p1, product_name='Organic Kent Mangoes', quantity=2000, price=1.50, unit='kg', availability_status='Available')
    Product.objects.create(project=p3, product_name='Greenhouse Tomatoes', quantity=500, price=2.00, unit='kg', availability_status='Available')
    Product.objects.create(project=p4, product_name='Fresh Okra', quantity=0, price=3.0, unit='kg', availability_status='Out of Stock')

    # Create Transactions
    Transaction.objects.create(user=u1, type='expense', amount=15000, date=date(2024, 1, 20), description='Expense for Tractor Purchase', site=s1, category='Equipment')
    Transaction.objects.create(user=u1, type='expense', amount=1500, date=date(2024, 5, 15), description='Expense for Seed Funding (Millet)', site=s2, project=p2, category='Supplies')
    Transaction.objects.create(user=u1, type='income', amount=1500, date=date(2024, 7, 10), description='Sale of 1000kg Organic Kent Mangoes', site=s1, project=p1)
    
    Transaction.objects.create(user=u3, type='expense', amount=8000, date=date(2023, 12, 5), description='Expense for Greenhouse Setup', site=s3, project=p3, category='Infrastructure')
    Transaction.objects.create(user=u3, type='income', amount=800, date=date(2024, 6, 25), description='Sale of 400kg Greenhouse Tomatoes', site=s3, project=p3)
    
    Transaction.objects.create(user=u4, type='expense', amount=12000, date=date(2024, 3, 10), description='Expense for Irrigation System Upgrade', site=s4, project=p5, category='Infrastructure')

    Transaction.objects.create(user=u2, type='expense', amount=750, date=date(2024, 7, 11), description='Purchase of 500kg Organic Kent Mangoes', category='Supplies')
    Transaction.objects.create(user=u2, type='expense', amount=400, date=date(2024, 6, 26), description='Purchase of 200kg Greenhouse Tomatoes', category='Supplies')

    print("Data seeding complete.")

if __name__ == '__main__':
    seed_data()
```

---

## 10. Migrations and Database Seeding

First, create and apply the database migrations.

```bash
python manage.py makemigrations
python manage.py migrate
```

Next, run the seeding script.

```bash
python manage.py shell < seed_data.py
```
---

## 11. Running the Backend Server

```bash
# First, create a superuser to access the admin panel (if you haven't)
python manage.py createsuperuser

# Now, run the server
python manage.py runserver
```

Your Django backend is now running at `http://127.0.0.1:8000/`.

**Key API Endpoints:**
- **Admin:** `http://127.0.0.1:8000/admin/`
- **Register:** `POST /api/auth/register/`
- **Login:** `POST /api/auth/login/`
- **Profile:** `GET/PUT /api/auth/profile/`
- **Sites:** `GET/POST/PUT/DELETE /api/sites/`
- **Projects:** `GET/POST/PUT/DELETE /api/projects/`
- **Products:** `GET/POST/PUT/DELETE /api/products/`
- **Transactions:** `GET/POST/PUT/DELETE /api/finance/transactions/`
- **Analytics Summary:** `GET /api/analytics/summary/`