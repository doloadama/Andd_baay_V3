from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from sites.views import SiteViewSet
from projects.views import ProjectViewSet
from market.views import ProductViewSet
from finance.views import TransactionViewSet, InvestmentViewSet

router = DefaultRouter()
router.register(r'sites', SiteViewSet, basename='site')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'finance/transactions', TransactionViewSet, basename='transaction')
router.register(r'finance/investments', InvestmentViewSet, basename='investment')

urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)