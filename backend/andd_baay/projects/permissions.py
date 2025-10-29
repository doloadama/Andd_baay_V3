from rest_framework import permissions

class IsSiteOwner(permissions.BasePermission):
    """
    Custom permission to only allow the owner of a site to manage its projects.
    """
    def has_object_permission(self, request, view, obj):
        return obj.site.farmer == request.user