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
