from django.urls import path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from .views import upload_file, list_files, get_file_content, enrich_data, healthcheck, delete_file, rename_file, debug_template_path

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('healthcheck.json', healthcheck),
    path('api/upload', upload_file, name='upload_file'),
    path('api/files', list_files, name='list_files'),
    path('api/files/<str:filename>', get_file_content, name='get_file_content'),
    path('api/files/delete/<str:filename>', delete_file, name='delete_file'),
    path('api/files/rename/<str:filename>', rename_file, name='rename_file'),
    path('api/enrich', enrich_data, name='enrich_data'),
    path('debug-template-path', debug_template_path),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
