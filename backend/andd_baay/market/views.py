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