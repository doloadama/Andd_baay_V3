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