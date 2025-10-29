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