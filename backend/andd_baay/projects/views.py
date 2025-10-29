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