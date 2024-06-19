from django.urls import path
from django.views.generic import TemplateView
from .views import upload_file, list_files, get_file_content, enrich_data, healthcheck

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('healthcheck.json', healthcheck),
    path('api/upload', upload_file, name='upload_file'),
    path('api/files', list_files, name='list_files'),
    path('api/files/<str:filename>', get_file_content, name='get_file_content'),
    path('api/enrich', enrich_data, name='enrich_data'),
]
