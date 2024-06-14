from django.urls import path
from django.views.generic import TemplateView
from .views import upload_file, healthcheck

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('healthcheck.json', healthcheck),
    path('api/upload', upload_file, name='upload_file'),
]
